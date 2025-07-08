import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient"); // Default role to 'patient'

  // States for Doctor-specific fields
  const [specialization, setSpecialization] = useState("");
  const [name, setName] = useState(""); // Add state for name
  const [location, setLocation] = useState(""); // Add state for location
  // Default availability (doctors will set it fully later)
  const defaultAvailability = [];

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3022";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear previous errors

    try {
      // Basic client-side validation
      if (
        !username ||
        !email ||
        !password ||
        !role ||
        (role === "doctor" && !specialization)
      ) {
        setError(
          "Please fill in all required fields, including specialization for doctors."
        );
        setLoading(false);
        return;
      }

      const payload = {
        username,
        email,
        password,
        role,
        name: name || username, // Send name, default to username if not entered
        location: location || "", // Send location
      };

      if (role === "doctor") {
        payload.specialization = specialization;
        payload.availability = defaultAvailability; // Send default availability
      }

      console.log("Registering with payload:", payload);
      const response = await axios.post(
        `${API_BASE_URL}/auth/register`,
        payload
      );

      console.log("Registration API response:", response.data);

      // --- CRITICAL FIX: Store token and user info from response.data ---
      const { token, user } = response.data; // Destructure both token and user
      if (token && user) {
        localStorage.setItem("token", token);
        localStorage.setItem("username", user.username); // Store username for quick display
        localStorage.setItem("userInfo", JSON.stringify(user)); // Store full user object
        console.log(
          "Registration successful! Token and user info stored in localStorage."
        );
        navigate("/dashboard"); // Redirect to dashboard on successful registration
      } else {
        setError(
          "Registration successful, but failed to receive authentication token or user info. Please log in."
        );
        console.error(
          "Registration response missing token or user:",
          response.data
        );
        navigate("/login"); // Fallback to login if token not received
      }
      // --- END CRITICAL FIX ---
    } catch (err) {
      console.error("Registration error:", err);

      if (err.response) {
        setError(
          err.response.data.message ||
            err.response.data.error ||
            "Registration failed."
        );
      } else if (err.request) {
        setError(
          "No response from server. Please ensure the backend is running and accessible."
        );
      } else {
        setError("An unexpected error occurred during registration.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-green-500 p-4">
      {loading ? (
        <div className="text-white text-2xl font-bold">Registering...</div>
      ) : (
        <form
          className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-sm md:max-w-md lg:max-w-lg mx-auto flex flex-col items-center"
          onSubmit={handleSubmit}
        >
          <h1 className="text-3xl font-extrabold text-gray-800 mb-6 w-full text-center">
            Register
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative w-full mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="w-full mb-4">
            <label htmlFor="username" className="sr-only">
              Username
            </label>
            <input
              type="text"
              id="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-700 placeholder-gray-500"
              aria-label="Username"
              required
            />
          </div>

          <div className="w-full mb-4">
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-700 placeholder-gray-500"
              aria-label="Email"
              required
            />
          </div>

          <div className="w-full mb-6">
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-700 placeholder-gray-500"
              aria-label="Password"
              required
            />
          </div>

          <div className="w-full mb-6">
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-700"
              aria-label="Select Role"
              required
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Conditional Name and Location inputs for all users (good practice for profiles) */}
          <div className="w-full mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full Name (Optional)
            </label>
            <input
              type="text"
              id="name"
              placeholder="Your Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-700 placeholder-gray-500"
              aria-label="Full Name"
            />
          </div>

          <div className="w-full mb-6">
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Location (Optional)
            </label>
            <input
              type="text"
              id="location"
              placeholder="Your City/Region"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-700 placeholder-gray-500"
              aria-label="Location"
            />
          </div>

          {/* Conditional Specialization Input for Doctors */}
          {role === "doctor" && (
            <div className="w-full mb-6">
              <label
                htmlFor="specialization"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Specialization
              </label>
              <input
                type="text"
                id="specialization"
                placeholder="e.g., Cardiology, Pediatrics"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-700 placeholder-gray-500"
                aria-label="Specialization"
                required // Make it required for doctors
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold py-2.5 px-4 rounded-md hover:from-blue-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105"
            disabled={loading}
          >
            {loading ? "Registering..." : "Sign Up"}
          </button>

          <div className="flex items-center w-full my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <Link
            to="/login"
            className="w-full bg-gray-100 text-gray-800 font-semibold py-2.5 px-4 rounded-md border border-gray-300 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition duration-300 ease-in-out transform hover:scale-105 text-center block"
          >
            Already have an account? Login
          </Link>
        </form>
      )}
    </div>
  );
}
