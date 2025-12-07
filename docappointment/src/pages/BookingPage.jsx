import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import GetUserInfo from "../utils/GetUserInfo.jsx";

export default function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const doctorIdFromUrl = searchParams.get("doctorId");
  const [Form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    doctorId: doctorIdFromUrl || "",
    symptoms: "",
    signs: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [user, setUser] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3022";

  useEffect(() => {
    const loadUserInfo = async () => {
      const userInfo = await GetUserInfo();
      if (userInfo && userInfo.token) {
        setUser(userInfo);
        setForm((prevForm) => ({
          ...prevForm,
          name: prevForm.name || userInfo.username || "",
          email: prevForm.email || userInfo.email || "",
        }));
      } else {
        navigate("/login");
      }
    };
    loadUserInfo();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!user || !user.token) {
      setError(
        "You must be logged in to book an appointment. Redirecting to login."
      );
      navigate("/login");
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      console.log("BookingPage: Form state before submission:", Form);

      const response = await axios.post(
        `${API_BASE_URL}/api/appointments`,
        Form,
        config
      );

      console.log("Appointment booked successfully:", response.data);
      setSuccessMessage("Appointment booked successfully!");

      setTimeout(() => {
        setForm({
          name: "",
          email: "",
          phone: "",
          date: "",
          time: "",
          doctorId: searchParams.get("doctorId") || "",
          symptoms: "",
          signs: "",
        });
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      console.error({ "error booking appointment": err });
      if (err.response) {
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4">
        <p className="text-gray-700 text-lg sm:text-xl">
          Loading user data or redirecting...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4 sm:p-6">
      <form
        className="max-w-2xl w-full bg-white shadow-xl rounded-2xl p-6 sm:p-8 space-y-5 sm:space-y-6 border border-blue-100"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          Book Your Appointment
        </h2>

        {successMessage && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl relative text-sm sm:text-base"
            role="alert"
          >
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}
        {error && (
          <div
            className="bg-red-100 border border-red-400  text-red-700 px-4 py-3 rounded-xl relative text-sm sm:text-base"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              className="w-full px-4 py-2.5 border border-gray-300  text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
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
              className="w-full px-4 py-2.5 border border-gray-300 text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
              value={Form.email}
              onChange={(e) => setForm({ ...Form, email: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              className="w-full px-4 py-2.5 border border-gray-300 text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
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
              className="w-full px-4 py-2.5 border border-gray-300 text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
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
              className="w-full px-4 py-2.5 border border-gray-300 text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
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
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20 sm:h-24 resize-y transition-all text-sm sm:text-base"
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
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20 sm:h-24 resize-y transition-all text-sm sm:text-base"
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
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
            value={Form.doctorId}
            onChange={(e) => setForm({ ...Form, doctorId: e.target.value })}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-green-600 text-white py-3 sm:py-3.5 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out shadow-lg hover:shadow-xl text-base sm:text-lg"
        >
          Book Appointment
        </button>
      </form>
    </div>
  );
}