import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Availabledr({ limit }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3022";

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/doctors`);
        const allDoctors = response.data;
        
        // If limit is provided, slice the array
        const doctorsToShow = limit ? allDoctors.slice(0, limit) : allDoctors;
        setDoctors(doctorsToShow);
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError("Failed to load doctors. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [API_BASE_URL, limit]);

  const handleBookAppointment = (doctorId) => {
    navigate(`/book?doctorId=${doctorId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading doctors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-5 rounded-xl">
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="bg-cyan-50 border-l-4 border-cyan-400 text-cyan-700 p-5 rounded-xl">
        <p className="font-semibold">No doctors available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-teal-100">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
        Available Doctors
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {doctors.map((doctor) => (
          <div
            key={doctor._id}
            className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border-2 border-teal-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
          >
            <div className="flex items-start gap-4 mb-4">
              <img
                src={
                  doctor.user_id?.image ||
                  "https://via.placeholder.com/80/14b8a6/ffffff?text=Dr"
                }
                alt={doctor.user_id?.name || "Doctor"}
                className="w-20 h-20 rounded-full object-cover border-4 border-teal-400 shadow-lg"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  Dr. {doctor.user_id?.name || doctor.user_id?.username || "Unknown"}
                </h3>
                <p className="text-sm text-teal-700 font-semibold mb-2">
                  {doctor.specialization || "General Practice"}
                </p>
                <p className="text-sm text-gray-600">
                  {doctor.user_id?.location || "Location not specified"}
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-semibold text-gray-800">Email:</span>{" "}
                {doctor.user_id?.email || "N/A"}
              </p>
              {doctor.availability && doctor.availability.length > 0 && (
                <div className="text-sm text-gray-700">
                  <span className="font-semibold text-gray-800">Available:</span>{" "}
                  <span className="text-teal-600">
                    {doctor.availability.slice(0, 2).join(", ")}
                    {doctor.availability.length > 2 && "..."}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => handleBookAppointment(doctor._id)}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-4 focus:ring-teal-300 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              Book Appointment
            </button>
          </div>
        ))}
      </div>
      
      {limit && doctors.length >= limit && (
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/doctors")}
            className="text-teal-600 hover:text-teal-700 font-semibold hover:underline transition-colors"
          >
            View All Doctors →
          </button>
        </div>
      )}
    </div>
  );
}