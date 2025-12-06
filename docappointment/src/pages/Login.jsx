import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3022";
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
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

      const { token, user } = response.data;
      if (token && user) {
        localStorage.setItem("token", token);
        localStorage.setItem("username", user.username);
        localStorage.setItem("userInfo", JSON.stringify(user));
        console.log(
          "Login successful! Token and user info stored in localStorage."
        );
        navigate("/dashboard");
      } else {
        setError(
          "Login successful, but no token or user info received. Please try again."
        );
        console.error("Login response missing token or user:", response.data);
      }
    } catch (err) {
      console.error("Login error:", err);

      if (err.response) {
        setError(
          err.response.data.message ||
            err.response.data.error ||
            "Login failed."
        );
      } else if (err.request) {
        setError(
          "No response from server. Please ensure the backend is running."
        );
      } else {
        setError("An unexpected error occurred during login.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 p-4">
      {loading ? (
        <div className="text-cyan-600 text-2xl font-bold flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          Logging in...
        </div>
      ) : (
        <form
          className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm md:max-w-md lg:max-w-lg mx-auto flex flex-col items-center border-2 border-cyan-100"
          onSubmit={handleSubmit}
        >
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-6 w-full text-center">
            Welcome Back
          </h1>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-xl relative w-full mb-4 text-sm">
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-gray-700 placeholder-gray-400 transition-all"
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-gray-700 placeholder-gray-400 transition-all"
              aria-label="Password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3.5 px-4 rounded-xl hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-cyan-300 transition duration-300 ease-in-out transform hover:scale-[1.02] shadow-lg"
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
            className="w-full bg-white text-cyan-600 font-semibold py-3.5 px-4 rounded-xl border-2 border-cyan-500 hover:bg-cyan-50 focus:outline-none focus:ring-4 focus:ring-cyan-200 transition duration-300 ease-in-out transform hover:scale-[1.02] text-center block"
          >
            Don't have an account? Register
          </Link>
        </form>
      )}
    </div>
  );
}