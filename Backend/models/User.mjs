import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
   username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  password: { type: String }, // Highly recommend adding 'required: true' for security
  role: { type: String, required: true, enum: ["patient", "doctor", "admin"] },
  // 
  name: { type: String, required: false }, // Doctor's or Patient's full name
  image: { type: String, required: false }, // URL for profile picture
  location: { type: String, required: false }, // General location, e.g., for doctors
  });

const User = mongoose.model("User", userSchema);
export default User;
