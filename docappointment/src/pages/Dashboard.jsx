import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Availabledr from "../components/Availabledr.jsx";
import GetUserInfo from "../utils/GetUserInfo.jsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3022";

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
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

        setLoading(true);
        setError(null);

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
  }, [API_BASE_URL, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xl text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-6 rounded-lg">
          <p className="text-xl font-semibold">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isDoctor = user.role === "doctor";

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 min-h-screen">
      {/* Welcome Section */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-teal-100">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
          Welcome, {isDoctor ? "Dr. " : ""}
          {user.name || user.username || "User"}!
        </h1>
      </div>

      {/* Patient Quick Booking Ad */}
      {!isDoctor && (
        <div className="bg-gradient-to-br from-teal-100 to-cyan-100 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between max-w-5xl mx-auto shadow-lg border border-teal-200">
          <div className="mb-6 md:mb-0 md:mr-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
              Looking for a specialist doctor?
            </h2>
            <p className="text-gray-700 text-base md:text-lg mb-5 leading-relaxed">
              Upload a prescription and tell us what you need. We'll handle the rest!
            </p>
            <button
              className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              onClick={() => navigate("/book")}
            >
              BOOK NOW
            </button>
          </div>
          <div className="w-36 h-36 md:w-44 md:h-44 flex-shrink-0">
            <div className="w-full h-full bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
              <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Appointments */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md p-6 border border-teal-100">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Your Upcoming Appointments
          </h2>
          <div className="space-y-4">
            {appointments.length > 0 ? (
              appointments
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((appointment) => (
                  <div
                    key={appointment._id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 border-l-4 border-teal-400 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                      <img
                        src={
                          isDoctor
                            ? appointment.patient_Id?.image ||
                              "https://via.placeholder.com/48/14b8a6/ffffff?text=P"
                            : appointment.dr_id?.user_id?.image ||
                              "https://via.placeholder.com/48/0891b2/ffffff?text=D"
                        }
                        alt={
                          isDoctor
                            ? appointment.patient_Id?.username || "Patient"
                            : appointment.dr_id?.user_id?.name || "Doctor"
                        }
                        className="w-14 h-14 rounded-full object-cover border-3 border-teal-400 shadow-md"
                      />
                      <div>
                        <div className="text-base font-semibold text-gray-900">
                          {isDoctor
                            ? appointment.patient_Id?.username || "Patient N/A"
                            : `Dr. ${
                                appointment.dr_id?.user_id?.name || "Doctor N/A"
                              }`}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {isDoctor
                            ? `Email: ${appointment.patient_Id?.email || "N/A"}`
                            : appointment.dr_id?.specialization ||
                              "Specialization N/A"}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex flex-col items-center bg-white px-3 py-2 rounded-lg shadow-sm">
                        <span className="text-gray-600 text-xs">Date:</span>
                        <span className="font-semibold text-teal-700">
                          {new Date(appointment.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex flex-col items-center bg-white px-3 py-2 rounded-lg shadow-sm">
                        <span className="text-gray-600 text-xs">Time:</span>
                        <span className="font-semibold text-cyan-700">
                          {appointment.time}
                        </span>
                      </div>
                      {appointment.duration && (
                        <div className="flex flex-col items-center bg-white px-3 py-2 rounded-lg shadow-sm">
                          <span className="text-gray-600 text-xs">Duration:</span>
                          <span className="font-semibold text-blue-700">
                            {appointment.duration} mins
                          </span>
                        </div>
                      )}
                      <span
                        className={`px-4 py-2 text-xs rounded-full font-semibold shadow-sm ${
                          appointment.status === "booked"
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : appointment.status === "pending"
                            ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                            : "bg-red-100 text-red-700 border border-red-200"
                        }`}
                      >
                        {appointment.status.charAt(0).toUpperCase() +
                          appointment.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-gray-600 text-center py-6">
                {isDoctor
                  ? "You have no upcoming appointments."
                  : "You have no upcoming appointments. Time to "}{" "}
                {!isDoctor && (
                  <Link to="/book" className="text-teal-600 font-semibold hover:text-teal-700 hover:underline">
                    book one now!
                  </Link>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Available Doctors Widget */}
      <div className="max-w-5xl mx-auto">
        {!isDoctor && <Availabledr limit={2} />}
      </div>
    </div>
  );
}