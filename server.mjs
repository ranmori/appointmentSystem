import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import winston from "winston";

import User from "./Backend/models/User.mjs";
import Dr from "./Backend/models/Dr.mjs";
import Appointment from "./Backend/models/Appointment.mjs";

dotenv.config();
// validate missing environmental variables
const requiredEnvVars = [
  "PORT",
  "MongoDB",
  "JWT_SECRET",
  "CLIENT_URL",
  "NODE_ENV",
];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  logger.error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  logger.error("JWT_SECRET must be at least 32 characters long");
  process.exit(1);
}
const app = express();
// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
// // handle preflight
// app.options("*", cors());

// Different limits for different routes
app.use(express.json({ limit: "10mb" }));
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// production
// if (process.env.NODE_ENV === "production") {
//   logger.info = function () {};
// }

// ports
const PORT = process.env.PORT || 3022;
const MongoDB = process.env.MongoDB;

// connect to mongodb
mongoose
  .connect(MongoDB, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => logger.info("Connected to MongoDB"))
  .catch((err) => {
    logger.error("MongoDB connection error:", err);
    process.exit(1);
  });

// add a rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

// api routes
// Register
app.post("/auth/register", limiter, async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      role,
      specialization,
      name,
      image,
      location,
    } = req.body;

    logger.info("Registration attempt received for:", {
      username,
      email,
      role,
      name,
      image,
      location,
      specialization,
    });

    if (!username || !email || !password || !role) {
      logger.info(
        "Missing required registration fields (username, email, password, role)."
      );
      return res
        .status(400)
        .json({ error: "All required fields are missing." });
    }
    if (role === "doctor" && !specialization) {
      logger.info("Missing specialization for doctor role.");
      return res
        .status(400)
        .json({ error: "Specialization is required for doctor registration." });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      logger.info("User with this email or username already exists.");
      return res.status(409).json({
        error: "Username or email already exists. Please use a different one.",
      });
    }

    // Use 12-14 rounds minimum
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    // logger.info("Password hashed.");

    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      role,
      name: name || username,
      image:
        image ||
        (role === "doctor"
          ? "https://via.placeholder.com/150/4a90e2/ffffff?text=DR"
          : "https://via.placeholder.com/150/007bff/ffffff?text=U"),
      location: location || "",
    });
    await newUser.save();
    logger.info(
      "User saved to database! User ID:",
      newUser._id,
      "Role:",
      newUser.role
    );

    if (role === "doctor") {
      logger.info(
        "User registered as 'doctor', attempting to create Doctor profile..."
      );
      const newDoctorProfile = new Dr({
        user_id: newUser._id,
        specialization: specialization,
        availability: [],
      });
      await newDoctorProfile.save();
      logger.info(
        "Doctor profile created and linked successfully:",
        newDoctorProfile._id
      );
    }

    // Implement refresh tokens
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    logger.info(
      "JWT token generated for user:",
      newUser._id,
      "with role:",
      newUser.role
    );

    // --- FIX: Ensure full user object (including name, image, role) is returned ---
    res.status(201).json({
      message: "Registration successful!",
      token: token,
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role, // Explicitly include role
        name: newUser.name, // Explicitly include name
        image: newUser.image, // Explicitly include image
        location: newUser.location, // Explicitly include location
      },
    });
  } catch (err) {
    logger.error("Backend Error during registration:", err);
    if (err.code === 11000) {
      return res.status(409).json({
        error: "Email or username already exists. Please use a different one.",
      });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Server error during registration." });
  }
});

// --- Login Route ---
// --- Login Route ---
app.post("/auth/login", strictLimiter, async (req, res) => {
  logger.info("Login route hit! Request body:", req.body);
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // --- FIX: Ensure `role` is in JWT payload for login ---
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // --- FIX: Return full user object (including role, name, image) for login ---
    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name,
        image: user.image,
        location: user.location,
      },
    });
  } catch (err) {
    logger.error("Backend Error during login:", err);
    res.status(500).json({ error: "Internal server error during login" });
  }
});
// Middleware to verify JWT
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    logger.info("Authentication failed: No token provided.");
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }
  try {
    const decodedjwt = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedjwt.userId || !decodedjwt.role) {
      console.warn("JWT token missing userId or role in payload.");
      return res.status(401).json({
        error: "Unauthorized: Invalid token payload (missing userId or role).",
      });
    }

    req.user = await User.findById(decodedjwt.userId).select("-password");
    if (!req.user) {
      logger.info("Authentication failed: User not found from token ID.");
      return res.status(401).json({ error: "Unauthorized: User not found." });
    }
    // Ensure req.user object has the role from decoded token (important for subsequent checks)
    req.user.role = decodedjwt.role;

    next();
  } catch (error) {
    logger.error("Authentication error (JWT verify failed):", error);
    res.status(401).json({ error: "Unauthorized: Invalid token." });
  }
};
const authorize = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res
      .status(403)
      .json({ error: "Forbidden: Insufficient permissions" });
  }
  next();
};

// Create appointment
app.post("/api/appointments", authenticate, async (req, res) => {
  try {
    const { doctorId, date, time, notes, symptoms, signs } = req.body;
    if (!doctorId || !date || !time) {
      return res
        .status(400)
        .json({ error: "Missing required fields: doctorId, date, time" });
    }

    if (req.user.role !== "patient") {
      return res
        .status(403)
        .json({ error: "Only patients can book appointments." });
    }

    const doctor = await Dr.findOne({ user_id: doctorId });
    if (!doctor) {
      logger.info(`Doctor profile not found for user_id: ${doctorId}`);
      return res.status(404).json({ error: "Doctor not found." });
    }

    const appointmentDate = new Date(date);
    const now = new Date();
    const requestedDateISO = appointmentDate.toISOString().split("T")[0];

    // Validate date is not in the past
    if (appointmentDate < now.setHours(0, 0, 0, 0)) {
      return res
        .status(400)
        .json({ error: "Cannot book appointments in the past" });
    }

    // Validate date is not too far in the future (e.g., 6 months)
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 6);
    if (appointmentDate > maxDate) {
      return res.status(400).json({
        error: "Cannot book appointments more than 6 months in advance",
      });
    }

    const isAvailable = doctor.availability.some((slot) => {
      const slotDateISO = new Date(slot.date).toISOString().split("T")[0];
      return slotDateISO === requestedDateISO && slot.slots.includes(time);
    });

    if (!isAvailable) {
      logger.info("Selected slot is not available in doctor's schedule.");
      return res.status(409).json({ error: "Selected slot is not available." });
    }

    const existedAppoint = await Appointment.findOne({
      dr_id: doctor._id,
      date: requestedDateISO,
      time,
      status: { $ne: "cancelled" },
    });
    if (existedAppoint) {
      logger.info("Slot already booked for this doctor at this time.");
      return res
        .status(409)
        .json({ error: "Slot already booked by another patient." });
    }

    const newAppointment = new Appointment({
      dr_id: doctor._id,
      patient_Id: req.user._id,
      date: appointmentDate,
      time,
      notes,
      symptoms,
      signs,
      status: "booked",
    });
    await newAppointment.save();
    logger.info("New appointment booked:", newAppointment._id);
    res.status(201).json(newAppointment);
  } catch (err) {
    logger.error("Server error during appointment booking:", err);
    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid Doctor ID format." });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Server error during appointment booking." });
  }
});
// get appointments
// --- Get All Appointments (for AppointmentsPage) ---
app.get("/api/appointments", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let appointments;

    if (userRole === "patient") {
      appointments = await Appointment.find({ patient_Id: userId })
        .populate({
          path: "dr_id",
          select: "specialization user_id",
          populate: {
            path: "user_id",
            model: "User",
            select: "username email name image location",
          },
        })
        .populate("patient_Id", "username email name image");
    } else if (userRole === "doctor") {
      const doctorProfile = await Dr.findOne({ user_id: userId });
      if (!doctorProfile) {
        return res
          .status(404)
          .json({ message: "Doctor profile not found for this user ID." });
      }
      appointments = await Appointment.find({ dr_id: doctorProfile._id })
        .populate({
          path: "dr_id",
          select: "specialization user_id",
          populate: {
            path: "user_id",
            model: "User",
            select: "username email name image location",
          },
        })
        .populate("patient_Id", "username email name image");
    } else {
      return res.status(403).json({
        message:
          "Access denied. User role not recognized for appointment fetching.",
      });
    }

    appointments.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }
      return a.time.localeCompare(b.time);
    });

    res.status(200).json(appointments);
  } catch (error) {
    logger.error("Server Error in GET /api/appointments:", error);
    res
      .status(500)
      .json({ error: "Server Error: Unable to retrieve appointments." });
  }
});
// upcoming appointments

// Upcoming appointments
app.get("/api/appointments/upcoming", authenticate, async (req, res) => {
  try {
    const isDoctor = req.user.role === "doctor";
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));

    let filter = {
      date: { $gte: startOfToday },
      status: { $ne: "cancelled" },
    };

    let appointments;

    if (isDoctor) {
      const doctorProfile = await Dr.findOne({ user_id: req.user._id });
      if (!doctorProfile) {
        return res
          .status(404)
          .json({ error: "Doctor profile not found for the logged-in user." });
      }
      filter.dr_id = doctorProfile._id;

      appointments = await Appointment.find(filter)
        .sort({ date: 1, time: 1 })
        .populate("patient_Id", "username email name image");
    } else {
      filter.patient_Id = req.user._id;

      appointments = await Appointment.find(filter)
        .sort({ date: 1, time: 1 })
        .populate({
          path: "dr_id",
          select: "specialization user_id",
          populate: {
            path: "user_id",
            model: "User",
            select: "username email name image location",
          },
        });
    }

    res.json(appointments);
  } catch (err) {
    logger.error("Server error fetching upcoming appointments:", err);
    res
      .status(500)
      .json({ error: "Server error fetching upcoming appointments." });
  }
});

// Get doctors
app.get("/api/doctors", async (req, res) => {
  try {
    const { specialization, search } = req.query;

    let queryFilter = {};

    if (specialization) {
      queryFilter.specialization = { $regex: specialization, $options: "i" };
    }

    if (search) {
      const userQuery = {
        role: "doctor",
        $or: [
          { username: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } },
        ],
      };
      const users = await User.find(userQuery).select("_id");

      const userIds = users.map((user) => user._id);

      if (userIds.length > 0) {
        queryFilter.user_id = { $in: userIds };
      } else {
        return res.json([]);
      }
    }

    const doctors = await Dr.find(queryFilter).populate(
      "user_id",
      "username email name image location"
    );

    res.json(doctors);
  } catch (error) {
    logger.error("Error searching for doctors:", error);
    res.status(500).json({ error: "Server error during doctor search" });
  }
});

// --- Create Doctor (Admin only, as registration now handles initial creation) ---
app.post(
  "/api/doctors",
  authenticate,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const { user_id, specialization, availability } = req.body;
      if (!user_id || !specialization) {
        return res
          .status(400)
          .json({ error: "missing required fields: user_id, specialization" });
      }
      const newUser = await User.findById(user_id);
      if (!newUser || newUser.role !== "doctor") {
        return res
          .status(400)
          .json({ error: "Invalid user_id or user is not a doctor" });
      }
      const existingDoctorProfile = await Dr.findOne({ user_id });
      if (existingDoctorProfile) {
        return res
          .status(409)
          .json({ error: "Doctor profile already exists for this user." });
      }

      const newDoctor = new Dr({
        user_id,
        specialization,
        availability: availability || [],
      });
      await newDoctor.save();
      res.status(201).json(newDoctor);
    } catch (err) {
      logger.error("doctor creation error:", err);
      if (err.name === "ValidationError") {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: "Server error during doctor creation" });
    }
  }
);
// patch doctor

app.patch(
  "/api/doctors/:id",
  authenticate,
  authorize(["doctor", "admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { specialization, availability } = req.body;

      if (req.user.role === "doctor") {
        const doctorProfile = await Dr.findById(id);
        if (!doctorProfile || !doctorProfile.user_id.equals(req.user._id)) {
          return res.status(403).json({
            error: "Forbidden: You can only update your own doctor profile",
          });
        }
      }

      const doctor = await Dr.findByIdAndUpdate(
        id,
        { specialization, availability },
        { new: true, runValidators: true }
      );

      if (!doctor) {
        return res.status(404).json({ error: "Doctor profile not found" });
      }

      res.json(doctor);
    } catch (err) {
      logger.error("Error updating doctor profile:", err);
      if (err.name === "CastError") {
        return res.status(400).json({ error: "Invalid Doctor ID format" });
      }
      if (err.name === "ValidationError") {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: "Server error updating doctor profile" });
    }
  }
);

// --- Delete Doctor ---
app.delete(
  "/api/doctors/:id",
  authenticate,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const doctor = await Dr.findByIdAndDelete(req.params.id);
      if (!doctor) {
        return res.status(404).json({ error: "Doctor not found" });
      }

      if (doctor.user_id) {
        await User.deleteOne({ _id: doctor.user_id });
        logger.info(
          `Associated User ${doctor.user_id} deleted for doctor profile.`
        );
      }

      // Delete ALL appointments for this doctor (FIXED)
      await Appointment.deleteMany({ dr_id: doctor._id }); // Use doctor._id, not user._id

      res.json({ message: "Doctor deleted successfully" });
    } catch (err) {
      logger.error("Error deleting doctor:", err);
      res.status(500).json({ error: "Server error deleting doctor" });
    }
  }
);

// --- Manage Availability ---
app.patch(
  "/api/doctors/:id/availability",
  authenticate,
  authorize(["doctor", "admin"]),
  async (req, res) => {
    try {
      const { date, slots } = req.body;
      if (!date || !slots || !Array.isArray(slots)) {
        return res.status(400).json({ error: "Invalid availability data" });
      }

      if (req.user.role === "doctor") {
        const doctorProfile = await Dr.findById(req.params.id);
        if (!doctorProfile || !doctorProfile.user_id.equals(req.user._id)) {
          return res.status(403).json({
            error: "Forbidden: You can only update your own availability",
          });
        }
      }

      const doctor = await Dr.findById(req.params.id);
      if (!doctor) {
        return res.status(404).json({ error: "Doctor not found" });
      }

      const availabilityDate = new Date(date).toDateString();
      const existingSlot = doctor.availability.find(
        (slot) => new Date(slot.date).toDateString() === availabilityDate
      );

      if (existingSlot) {
        existingSlot.slots = slots;
      } else {
        doctor.availability.push({ date: new Date(date), slots });
      }
      await doctor.save();
      res.json(doctor);
    } catch (err) {
      logger.error("Server error managing availability:", err);
      if (err.name === "CastError") {
        return res.status(400).json({ error: "Invalid Doctor ID format" });
      }
      res.status(500).json({ error: "Server error managing availability" });
    }
  }
);
// Cancel appointment
app.patch("/api/appointments/:id/cancel", authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    const isPatient = req.user.role === "patient";
    let isAuthorized = false;

    if (isPatient) {
      isAuthorized = appointment.patient_Id.equals(req.user._id);
    } else if (req.user.role === "doctor") {
      const doctorProfile = await Dr.findOne({ user_id: req.user._id });
      if (doctorProfile) {
        isAuthorized = appointment.dr_id.equals(doctorProfile._id);
      }
    } else if (req.user.role === "admin") {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ error: "Unauthorized to cancel this appointment" });
    }

    if (appointment.status === "cancelled")
      return res.status(400).json({ error: "Appointment already cancelled" });

    const now = new Date();
    const appointmentDateTime = new Date(appointment.date);
    const [hours, minutes] = appointment.time.split(":").map(Number);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    const hoursUntil =
      (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntil < 24)
      return res.status(400).json({
        error: "Cannot cancel within 24 hours of appointment",
      });

    appointment.status = "cancelled";
    await appointment.save();
    res.json({
      message: "Appointment cancelled successfully",
      updatedAppointment: appointment,
    });
  } catch (err) {
    logger.error("Server error during appointment cancellation:", err);
    if (err.name === "CastError")
      return res.status(400).json({ error: "Invalid appointment ID" });
    res
      .status(500)
      .json({ error: "Server error during appointment cancellation" });
  }
});

// Get current logged-in user
// --- Get current logged-in user details (for Profile Settings and GetUserInfo) ---
app.get("/api/users/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password").lean();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.role === "doctor") {
      const doctorProfile = await Dr.findOne({ user_id: user._id })
        .select("specialization availability")
        .lean();
      return res.json({ ...user, doctorProfile });
    }
    res.json(user);
  } catch (err) {
    logger.error("Server error fetching user profile:", err);
    res.status(500).json({ error: "Server error fetching user profile" });
  }
});

// --- NEW ENDPOINT: PATCH /api/users/me (for Profile Settings update) ---
app.patch("/api/users/me", authenticate, async (req, res) => {
  try {
    const userId = req.user._id; // ID of the authenticated user
    const { username, email, name, location, image, password, specialization } =
      req.body;

    // Find the user document
    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return res.status(404).json({ error: "User not found." });
    }

    // Update user fields if provided
    if (username) userToUpdate.username = username;
    if (email) userToUpdate.email = email;
    if (name !== undefined) userToUpdate.name = name; // Allow setting to empty string
    if (location !== undefined) userToUpdate.location = location; // Allow setting to empty string
    if (image !== undefined) userToUpdate.image = image; // Base64 string or URL

    // Handle password change
    if (password) {
      userToUpdate.password = await bcrypt.hash(password, 12);
    }

    await userToUpdate.save(); // Save changes to the User document

    // If the user is a doctor, update their Dr profile as well
    if (userToUpdate.role === "doctor") {
      const doctorProfile = await Dr.findOne({ user_id: userId });
      if (doctorProfile) {
        if (specialization !== undefined) {
          // Allow setting specialization to empty string
          doctorProfile.specialization = specialization;
        }
        await doctorProfile.save();
        // Re-fetch user with updated doctorProfile for response consistency
        const updatedUserWithDoctorProfile = await User.findById(userId)
          .select("-password")
          .lean();
        const updatedDoctorProfileData = await Dr.findOne({ user_id: userId })
          .select("specialization availability")
          .lean();
        return res.json({
          message: "Profile updated successfully.",
          updatedUser: {
            ...updatedUserWithDoctorProfile,
            doctorProfile: updatedDoctorProfileData,
          },
        });
      }
    }

    // For non-doctors, or if doctorProfile wasn't found, return updated user directly
    const updatedUser = await User.findById(userId).select("-password").lean(); // Fetch updated user
    res.json({ message: "Profile updated successfully.", updatedUser });
  } catch (err) {
    logger.error("Error updating user profile (PATCH /api/users/me):", err);
    // Handle unique constraint errors (e.g., if new username/email already exists)
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ error: "Username or email already exists." });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Server error updating profile." });
  }
});
//  admin side
// admin gets all users

// --- Admin Side: Get All Users (PROTECTED) ---
// --- Admin Side: Get All Users (PROTECTED) ---
app.get("/api/users", authenticate, authorize(["admin"]), async (req, res) => {
  // <<< ADDED AUTHENTICATE AND AUTHORIZE
  try {
    const users = await User.find().select("-__v -password").lean();
    if (!users || users.length === 0) {
      return res.status(404).json({ error: "No users found" });
    }
    res.json(users);
  } catch (err) {
    logger.error("Error fetching all users:", err);
    res.status(500).json({ error: "Server error fetching users" });
  }
});

// --- Admin Side: Update Any User (NEW ENDPOINT)
app.patch(
  "/api/users/:id",
  authenticate,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        username,
        email,
        name,
        location,
        image,
        password,
        role,
        specialization,
      } = req.body;

      const userToUpdate = await User.findById(id);
      if (!userToUpdate) {
        return res.status(404).json({ error: "User not found." });
      }

      // Update user fields if provided and different from current
      if (username !== undefined && userToUpdate.username !== username)
        userToUpdate.username = username;
      if (email !== undefined && userToUpdate.email !== email)
        userToUpdate.email = email;
      if (name !== undefined && userToUpdate.name !== name)
        userToUpdate.name = name;
      if (location !== undefined && userToUpdate.location !== location)
        userToUpdate.location = location;
      if (image !== undefined && userToUpdate.image !== image)
        userToUpdate.image = image;

      // Only allow admin to change role
      if (role !== undefined && userToUpdate.role !== role) {
        userToUpdate.role = role;
      }

      // Handle password change
      if (password) {
        userToUpdate.password = await bcrypt.hash(password, 12);
      }

      await userToUpdate.save();

      // If the user's role is being changed to/from 'doctor' or specialization is updated
      if (userToUpdate.role === "doctor") {
        let doctorProfile = await Dr.findOne({ user_id: userToUpdate._id });
        if (!doctorProfile) {
          // If role changed to doctor and no profile exists, create one
          doctorProfile = new Dr({
            user_id: userToUpdate._id,
            specialization: specialization || "General",
          });
        } else if (
          specialization !== undefined &&
          doctorProfile.specialization !== specialization
        ) {
          // Update specialization if provided
          doctorProfile.specialization = specialization;
        }
        await doctorProfile.save();
      } else {
        // If role changed from doctor, consider deleting the Dr profile
        await Dr.deleteOne({ user_id: userToUpdate._id });
      }

      const finalUpdatedUser = await User.findById(id)
        .select("-password")
        .lean();
      res.json({
        message: "User updated successfully.",
        updatedUser: finalUpdatedUser,
      });
    } catch (err) {
      logger.error("Error updating user by admin (PATCH /api/users/:id):", err);
      if (err.code === 11000) {
        return res
          .status(409)
          .json({ error: "Username or email already exists." });
      }
      if (err.name === "ValidationError") {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: "Server error updating user." });
    }
  }
);

// --- Admin Side: Delete User (PROTECTED) ---
app.delete(
  "/api/users/:id",
  authenticate,
  authorize(["admin"]),
  async (req, res) => {
    // <<< ADDED AUTHENTICATE AND AUTHORIZE
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      if (user.role === "doctor" && user._id) {
        await Dr.deleteOne({ _id: user._id }); // Corrected: should be user_id, not _id
        logger.info(`Associated Doctor profile for user ${user._id} deleted.`);
      }
      // Also delete any appointments associated with this user (patient or doctor)
      await Appointment.deleteMany({
        $or: [{ patient_Id: user._id }, { dr_id: user._id }],
      });
      logger.info(`Associated appointments for user ${user._id} deleted.`);

      res.json({ message: "User deleted successfully" });
    } catch (err) {
      logger.error("Error deleting user:", err);
      res.status(500).json({ error: "Server error deleting user" });
    }
  }
);

// --- NEW ENDPOINT: Admin Summary (PROTECTED) ---
app.get(
  "/api/admin/summary",
  authenticate,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const totalDoctors = await Dr.countDocuments();
      const totalAppointments = await Appointment.countDocuments();
      const pendingAppointments = await Appointment.countDocuments({
        status: "pending",
      });

      res.json({
        totalUsers,
        totalDoctors,
        totalAppointments,
        pendingAppointments,
      });
    } catch (error) {
      logger.error("Error fetching admin summary:", error);
      res.status(500).json({ error: "Server error fetching admin summary." });
    }
  }
);

// --- NEW ENDPOINT: Admin Get All Appointments (PROTECTED) ---
app.get(
  "/api/admin/appointments",
  authenticate,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const appointments = await Appointment.find({})
        .populate({
          path: "dr_id",
          select: "specialization user_id",
          populate: {
            path: "user_id",
            model: "User",
            select: "username email name image location",
          },
        })
        .populate("patient_Id", "username email name image");

      appointments.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA - dateB;
        }
        return a.time.localeCompare(b.time);
      });

      res.status(200).json(appointments);
    } catch (error) {
      logger.error("Server Error in GET /api/admin/appointments:", error);
      res.status(500).json({
        error: "Server Error: Unable to retrieve all appointments for admin.",
      });
    }
  }
);

// --- NEW ENDPOINT: Admin Update Appointment Status (PROTECTED) ---
app.patch(
  "/api/admin/appointments/:id/status",
  authenticate,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body; // Expected status: 'pending', 'booked', 'cancelled', 'completed'

      if (
        !status ||
        !["pending", "booked", "cancelled", "completed"].includes(status)
      ) {
        return res
          .status(400)
          .json({ error: "Invalid or missing appointment status." });
      }

      const appointment = await Appointment.findByIdAndUpdate(
        id,
        { status: status },
        { new: true, runValidators: true }
      );

      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found." });
      }

      res.json({
        message: "Appointment status updated successfully.",
        updatedAppointment: appointment,
      });
    } catch (err) {
      logger.error("Server error updating appointment status:", err);
      if (err.name === "CastError") {
        return res
          .status(400)
          .json({ error: "Invalid Appointment ID format." });
      }
      if (err.name === "ValidationError") {
        return res.status(400).json({ error: err.message });
      }
      res
        .status(500)
        .json({ error: "Server error updating appointment status." });
    }
  }
);

// --- NEW ENDPOINT: Admin Delete Any Appointment (PROTECTED) ---
app.delete(
  "/api/admin/appointments/:id",
  authenticate,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const appointment = await Appointment.findByIdAndDelete(id);

      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found." });
      }

      res.json({ message: "Appointment deleted successfully." });
    } catch (err) {
      logger.error("Server error deleting appointment by admin:", err);
      if (err.name === "CastError") {
        return res
          .status(400)
          .json({ error: "Invalid Appointment ID format." });
      }
      res.status(500).json({ error: "Server error deleting appointment." });
    }
  }
);

// app.get("/health", (req, res) => {
//   const healthcheck = {
//     uptime: process.uptime(),
//     message: "OK",
//     timestamp: Date.now(),
//     mongoStatus:
//       mongoose.connection.readyState === 1 ? "connected" : "disconnected",
//   };
//   res.status(200).json(healthcheck);
// });
// // route to undefines routes
// app.all('*', (req, res) => {
//   res.status(404).json({
//     error: `Can't find ${req.originalUrl} on this server!`
//   });
// });

app.listen(PORT, () => {
  logger.info(`listening to server on ${PORT}`);
});
