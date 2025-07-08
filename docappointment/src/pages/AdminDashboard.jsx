import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import GetUserInfo from "../utils/GetUserInfo.jsx"; // Utility to get user info and token

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryData, setSummaryData] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
  });
  // Define API_BASE_URL using environment variable
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3022";

  useEffect(() => {
    const loadAdminDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const userInfo = await GetUserInfo();
        if (!userInfo || !userInfo.token) {
          console.log(
            "AdminDashboard: No user info or token found, redirecting to login."
          );
          navigate("/login");
          return;
        }

        console.log(
          "AdminDashboard: Logged-in user role detected as:",
          userInfo.role
        ); // DEBUG LOG

        // Check if the user has the 'admin' role
        if (userInfo.role !== "admin") {
          console.warn(
            "AdminDashboard: User is NOT an admin. Redirecting to regular dashboard."
          );
          navigate("/dashboard"); // Redirect to regular dashboard if not admin
          return;
        }

        setUser(userInfo);

        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        // --- FIX: Use the dedicated /api/admin/summary endpoint ---
        const summaryRes = await axios.get(
          `${API_BASE_URL}/api/admin/summary`,
          config
        );

        setSummaryData({
          totalUsers: summaryRes.data.totalUsers,
          totalDoctors: summaryRes.data.totalDoctors,
          totalAppointments: summaryRes.data.totalAppointments,
          pendingAppointments: summaryRes.data.pendingAppointments,
        });
      } catch (err) {
        console.error("AdminDashboard: Error loading data:", err);
        if (err.response) {
          console.error(
            "AdminDashboard: Backend Response Status:",
            err.response.status
          );
          console.error(
            "AdminDashboard: Backend Response Data:",
            err.response.data
          );
          if (err.response.status === 401) {
            navigate("/login"); // Unauthorized, redirect to login
          } else if (err.response.status === 403) {
            // If 403, it means authentication succeeded but authorization failed.
            // This implies the user is logged in but doesn't have the 'admin' role for the specific endpoint.
            // We should still redirect them to a non-admin page.
            navigate("/dashboard"); // Forbidden, redirect to regular dashboard
          } else {
            setError(
              err.response.data.error ||
                err.response.data.message ||
                "Failed to load admin data."
            );
          }
        } else if (err.request) {
          setError(
            "Network error: No response from server. Backend might be down."
          );
        } else {
          setError("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadAdminDashboard();
  }, [API_BASE_URL, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl text-gray-600">Loading Admin Dashboard...</p>
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

  if (!user || user.role !== "admin") {
    return null; // Should have been redirected by useEffect, but a safety fallback
  }

  return (
    <div className="p-6 space-y-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800">
        Admin Dashboard - Welcome, {user.username}!
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Total Users
          </h2>
          <p className="text-4xl font-bold text-blue-600">
            {summaryData.totalUsers}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Total Doctors
          </h2>
          <p className="text-4xl font-bold text-green-600">
            {summaryData.totalDoctors}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Total Appointments
          </h2>
          <p className="text-4xl font-bold text-purple-600">
            {summaryData.totalAppointments}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Pending Appointments
          </h2>
          <p className="text-4xl font-bold text-yellow-600">
            {summaryData.pendingAppointments}
          </p>
        </div>
      </div>

      {/* Admin Navigation / Quick Links */}
      <div className="max-w-5xl mx-auto space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">
          Management Sections
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/admin/users"
            className="bg-blue-200 text-white p-4 rounded-lg shadow-md hover:bg-blue-300 transition-colors text-center font-semibold text-lg"
          >
            Manage Users
          </Link>
          <Link
            to="/admin/doctors"
            className="bg-green-200 text-white p-4 rounded-lg shadow-md hover:bg-green-300 transition-colors text-center font-semibold text-lg"
          >
            Manage Doctors
          </Link>
          <Link
            to="/admin/appointments"
            className="bg-purple-200 text-white p-4 rounded-lg shadow-md hover:bg-purple-300 transition-colors text-center font-semibold text-lg"
          >
            Manage Appointments
          </Link>
        </div>
      </div>
    </div>
  );
}
