import React, { useState, useEffect } from "react"; // Ensure useEffect is imported
import axios from "axios";

import { useNavigate, useSearchParams } from "react-router-dom"; // Import useNavigate and useSearchParams
import GetUserInfo from "../utils/GetUserInfo.jsx"; // Import GetUserInfo utility

export default function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // Hook to read query parameters
  const doctorIdFromUrl = searchParams.get("doctorId");
  const [Form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    doctorId: doctorIdFromUrl || "", // Pre-fill doctorId from URL query param
    symptoms: "",
    signs: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [user, setUser] = useState(null); // State to hold current user info

  //  api url base
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3022";

  // --- CRITICAL: useEffect to load user info and token ---
  useEffect(() => {
    const loadUserInfo = async () => {
      const userInfo = await GetUserInfo();
      if (userInfo && userInfo.token) {
        setUser(userInfo);
        // Optionally pre-fill name/email/phone from userInfo if available
        setForm((prevForm) => ({
          ...prevForm,
          name: prevForm.name || userInfo.username || "", // Only set if not already typed/pre-filled
          email: prevForm.email || userInfo.email || "",
        }));
      } else {
        // If no user info, redirect to login (this page requires authentication)
        navigate("/login");
      }
    };
    loadUserInfo();
  }, [navigate]);
  // --- END CRITICAL useEffect ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // --- CRITICAL: Check for user and token before submitting ---
    if (!user || !user.token) {
      setError(
        "You must be logged in to book an appointment. Redirecting to login."
      );
      navigate("/login"); // Ensure user is logged in
      return;
    }
    // --- END CRITICAL Check ---

    try {
      // --- CRITICAL: Attach Authorization header ---
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`, // Use the token from the 'user' state
        },
      };
      console.log("BookingPage: Form state before submission:", Form);

      // IMPORTANT: Use the full backend URL for your API call
      const response = await axios.post(
        `${API_BASE_URL}/api/appointments`,
        Form,
        config
      );
      // --- END CRITICAL Attach Header ---

      console.log("Appointment booked successfully:", response.data);
      setSuccessMessage("Appointment booked successfully!");

      setTimeout(() => {
        setForm({
          // Reset form fields
          name: "",
          email: "",
          phone: "",
          date: "",
          time: "",
          doctorId: searchParams.get("doctorId") || "", // Keep doctorId if from URL
          symptoms: "",
          signs: "",
        });
        navigate("/dashboard"); // Redirect to dashboard or a success page
      }, 2000);
    } catch (err) {
      console.error({ "error booking appointment": err });
      if (err.response) {
        // Handle 401 specifically: token expired or invalid
        if (err.response.status === 401) {
          setError("Session expired or unauthorized. Please log in again.");
          localStorage.removeItem("token");
          localStorage.removeItem("username");
          localStorage.removeItem("userInfo");
          navigate("/login");
        } else {
          setError(
            err.response.data.error ||
              "Failed to book appointment. Please try again later."
          );
        }
      } else if (err.request) {
        setError(
          "Network error. Please check your connection or server status."
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  // --- CRITICAL: Show loading/redirect if user data not yet loaded ---
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
        <p className="text-white text-xl">
          Loading user data or redirecting...
        </p>
      </div>
    );
  }
  // --- END CRITICAL Loading State ---

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center p-4">
        <form
          className="max-w-xl w-full bg-white shadow-xl rounded-lg p-8 space-y-6 border border-gray-200"
          onSubmit={handleSubmit}
        >
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
            Book Your Appointment
          </h2>

          {successMessage && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                className="input input-bordered w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={Form.name}
                onChange={(e) => setForm({ ...Form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input input-bordered w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={Form.email}
                onChange={(e) => setForm({ ...Form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone (Optional)
              </label>
              <input
                id="phone"
                type="tel"
                className="input input-bordered w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={Form.phone}
                onChange={(e) => setForm({ ...Form, phone: e.target.value })}
              />
            </div>
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date
              </label>
              <input
                id="date"
                type="date"
                className="input input-bordered w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={Form.date}
                onChange={(e) => setForm({ ...Form, date: e.target.value })}
                required
              />
            </div>
            <div>
              <label
                htmlFor="time"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Time
              </label>
              <input
                id="time"
                type="time"
                className="input input-bordered w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={Form.time}
                onChange={(e) => setForm({ ...Form, time: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="symptoms"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Symptoms (What you feel)
            </label>
            <textarea
              id="symptoms"
              className="textarea textarea-bordered w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-y"
              value={Form.symptoms}
              onChange={(e) => setForm({ ...Form, symptoms: e.target.value })}
              placeholder="e.g., headache, fever, cough, fatigue..."
            ></textarea>
          </div>

          <div>
            <label
              htmlFor="signs"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Signs (What you observe)
            </label>
            <textarea
              id="signs"
              className="textarea textarea-bordered w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-y"
              value={Form.signs}
              onChange={(e) => setForm({ ...Form, signs: e.target.value })}
              placeholder="e.g., rash, swelling, redness, difficulty breathing..."
            ></textarea>
          </div>

          <div>
            <label
              htmlFor="doctorId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Doctor ID
            </label>
            <input
              id="doctorId"
              type="text"
              className="input input-bordered w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={Form.doctorId}
              onChange={(e) => setForm({ ...Form, doctorId: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
          >
            Book Appointment
          </button>
        </form>
      </div>
    </>
  );
}
