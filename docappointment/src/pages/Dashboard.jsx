import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Availabledr from "../components/Availabledr.jsx"; // Available Doctors Widget
import GetUserInfo from "../utils/GetUserInfo.jsx"; // Utility to get user info

export default function Dashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Define API_BASE_URL using environment variable
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3022";

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // --- 1. Fetch User Info ---
        console.log("Dashboard.jsx: Calling GetUserInfo()...");
        const userInfo = await GetUserInfo();
        console.log("Dashboard.jsx: User Info received:", userInfo);

        if (!userInfo || !userInfo.token) {
          console.log(
            "Dashboard: No user info or token found, redirecting to login."
          );
          navigate("/login");
          return;
        }
        setUser(userInfo);
        console.log("Dashboard: User Info loaded:", userInfo);

        // --- 2. Fetch Upcoming Appointments ---
        setLoading(true);
        setError(null); // Clear previous errors

        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        console.log(
          "Dashboard.jsx: Attempting to fetch upcoming appointments from backend..."
        );
        const res = await axios.get(
          `${API_BASE_URL}/api/appointments/upcoming`,
          config
        );

        console.log(
          "Dashboard.jsx: API response data for upcoming appointments:",
          res.data
        );

        // Validate and set appointments data
        let fetchedAppointments = [];
        if (Array.isArray(res.data)) {
          fetchedAppointments = res.data;
        } else if (
          res.data &&
          typeof res.data === "object" &&
          Array.isArray(res.data.appointments)
        ) {
          fetchedAppointments = res.data.appointments;
        } else {
          console.warn(
            "Dashboard.jsx: API returned non-array or unexpected format for appointments:",
            res.data
          );
          setError(
            "Failed to load appointments. The server returned an unexpected format."
          );
        }
        setAppointments(fetchedAppointments);
      } catch (err) {
        console.error(
          "Dashboard.jsx: Error initializing dashboard or fetching appointments:",
          err
        );
        if (err.response && err.response.status === 401) {
          console.log(
            "Dashboard: API call Unauthorized, redirecting to login."
          );
          localStorage.removeItem("token");
          localStorage.removeItem("username");
          localStorage.removeItem("userInfo");
          navigate("/login");
        } else if (
          err.response &&
          err.response.data &&
          (err.response.data.message || err.response.data.error)
        ) {
          setError(err.response.data.message || err.response.data.error);
        } else {
          setError(
            "Failed to load appointments. Please check your network or try again."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [API_BASE_URL, navigate]); // navigate is a dependency to avoid stale closure issues

  // --- Render based on loading/error/user state ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 text-red-600">
        <p className="text-xl">Error: {error}</p>
      </div>
    );
  }

  // If user is null after loading (should be redirected by useEffect, but for safety)
  if (!user) {
    return null;
  }

  const isDoctor = user.role === "doctor";

  return (
    // The main container for the dashboard content
    // Note: The Layout component should provide the overall min-h-screen and grid for sidebar/navbar.
    // This component will fill the main content area of the Layout.
    <div className="p-6 space-y-8 bg-gray-100 min-h-screen">
      {" "}
      {/* Added min-h-screen for standalone view if not using Layout yet */}
      {/* Welcome Section */}
      <h1 className="text-3xl font-bold text-gray-800">
        Welcome, {isDoctor ? "Dr. " : ""}
        {user.name || user.username || "User"}!{" "}
        {/* Prefer 'name' if available, otherwise 'username' */}
      </h1>
      {/* Patient Specific Section: Quick Booking Ad */}
      {!isDoctor && (
        <div className="bg-purple-100 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between max-w-5xl mx-auto shadow-md text-start">
          <div className="mb-6 md:mb-0 md:mr-8">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
              Looking for a specialist doctor?
            </h2>
            <p className="text-gray-700 text-base md:text-md mb-4">
              Upload a Prescription and Tell Us what you Need. We do the Rest!
            </p>
            <button
              className="bg-purple-800 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-900 transition"
              onClick={() => navigate("/book")}
            >
              BOOK NOW
            </button>
          </div>
          <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
            {/* Placeholder image for a doctor */}
            <img
              src="https://placehold.co/160x160/D8BFD8/8A2BE2?text=Doctor" // Generic placeholder for a doctor
              alt="Smiling female doctor"
              className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
            />
          </div>
        </div>
      )}
      {/* Upcoming Appointments Section */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Your Upcoming Appointments
        </h2>
        <div className="space-y-3">
          {appointments.length > 0 ? (
            // Sort appointments by date to show chronologically
            appointments
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map((appointment) => (
                <div
                  key={appointment._id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg shadow-md bg-white border border-gray-200"
                >
                  <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                    {/* Display image of the other party (patient for doctor, doctor for patient) */}
                    <img
                      src={
                        isDoctor
                          ? appointment.patient_Id?.image ||
                            "https://via.placeholder.com/48/007bff/ffffff?text=P" // Default for patient
                          : appointment.dr_id?.user_id?.image ||
                            "https://via.placeholder.com/48/4a90e2/ffffff?text=D" // Default for doctor
                      }
                      alt={
                        isDoctor
                          ? appointment.patient_Id?.username || "Patient"
                          : appointment.dr_id?.user_id?.name || "Doctor"
                      }
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-400"
                    />
                    <div>
                      {/* Display name/username of the other party */}
                      <div className="text-base font-medium text-gray-900">
                        {isDoctor
                          ? appointment.patient_Id?.username || "Patient N/A"
                          : `Dr. ${
                              appointment.dr_id?.user_id?.name || "Doctor N/A"
                            }`}
                      </div>
                      {/* Display contact info/specialization of the other party */}
                      <div className="text-xs text-gray-500">
                        {isDoctor
                          ? `Email: ${appointment.patient_Id?.email || "N/A"}`
                          : appointment.dr_id?.specialization ||
                            "Specialization N/A"}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex flex-col items-center">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-semibold text-gray-800">
                        {new Date(appointment.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-semibold text-gray-800">
                        {appointment.time}
                      </span>
                    </div>
                    {appointment.duration && (
                      <div className="flex flex-col items-center">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-semibold text-gray-800">
                          {appointment.duration} mins
                        </span>
                      </div>
                    )}
                    {/* Appointment Status Badge */}
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-semibold ${
                        appointment.status === "booked"
                          ? "bg-green-100 text-green-800"
                          : appointment.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800" // Fallback for cancelled or other
                      }`}
                    >
                      {appointment.status.charAt(0).toUpperCase() +
                        appointment.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))
          ) : (
            // Message if no upcoming appointments
            <p className="text-gray-600 text-center py-4">
              {isDoctor
                ? "You have no upcoming appointments."
                : "You have no upcoming appointments. Time to "}{" "}
              {!isDoctor && (
                <Link to="/book" className="text-purple-700 hover:underline">
                  book one now!
                </Link>
              )}
            </p>
          )}
        </div>
      </div>
      {/* Available Doctors Widget (only for patients) */}
      <div className="max-w-5xl mx-auto">
        {" "}
        {/* Added max-w-5xl mx-auto for consistency */}
        {!isDoctor && <Availabledr limit={2} />}
      </div>
    </div>
  );
}
