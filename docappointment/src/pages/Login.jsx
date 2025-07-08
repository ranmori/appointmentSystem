import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // api base url
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3022";

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear previous errors

    try {
      // Basic client-side validation
      if (!username || !password) {
        setError("Please enter both username and password.");
        setLoading(false);
        return;
      }

      console.log("Attempting to log in with:", { username });
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password,
      });

      console.log("Login API response:", response.data);

      // --- CRITICAL FIX: Store token and user info from response.data ---
      const { token, user } = response.data; // Destructure both token and user
      if (token && user) {
        localStorage.setItem("token", token);
        localStorage.setItem("username", user.username); // Store username for quick display
        localStorage.setItem("userInfo", JSON.stringify(user)); // Store full user object
        console.log(
          "Login successful! Token and user info stored in localStorage."
        );
        navigate("/dashboard"); // Redirect to dashboard on successful login
      } else {
        setError(
          "Login successful, but no token or user info received. Please try again."
        );
        console.error("Login response missing token or user:", response.data);
      }
      // --- END CRITICAL FIX ---
    } catch (err) {
      console.error("Login error:", err);

      if (err.response) {
        // Handle specific backend error messages
        setError(
          err.response.data.message ||
            err.response.data.error ||
            "Login failed."
        );
      } else if (err.request) {
        // Network error
        setError(
          "No response from server. Please ensure the backend is running."
        );
      } else {
        // Other unexpected errors
        setError("An unexpected error occurred during login.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4">
      {loading ? (
        <div className="text-white text-2xl font-bold">Logging in...</div>
      ) : (
        <form
          className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-sm md:max-w-md lg:max-w-lg mx-auto flex flex-col items-center"
          onSubmit={handleSubmit}
        >
          <h1 className="text-3xl font-extrabold text-gray-800 mb-6 w-full text-center">
            Login
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

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold py-2.5 px-4 rounded-md hover:from-blue-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105"
            disabled={loading}
          >
            {loading ? "Logging In..." : "Log In"}
          </button>

          <div className="flex items-center w-full my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <Link
            to="/register"
            className="w-full bg-gray-100 text-gray-800 font-semibold py-2.5 px-4 rounded-md border border-gray-300 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition duration-300 ease-in-out transform hover:scale-105 text-center block"
          >
            Don't have an account? Register
          </Link>
        </form>
      )}
    </div>
  );
}
