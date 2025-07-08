import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Use Link for navigation if possible

// Pass a 'limit' prop to control how many doctors are shown
export default function Availabledr({ limit = 2 }) {
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define API_BASE_URL using environment variable
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3022";

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use API_BASE_URL for the doctors endpoint
        const response = await axios.get(`${API_BASE_URL}/api/doctors`);
        console.log(
          "AvailableDoctorsWidget: API response data:",
          response.data
        );

        let doctorsData = [];
        if (Array.isArray(response.data)) {
          doctorsData = response.data;
        } else if (response.data && Array.isArray(response.data.doctors)) {
          doctorsData = response.data.doctors;
        } else {
          console.warn(
            "AvailableDoctorsWidget: Unexpected API response format:",
            response.data
          );
          setError("Received unexpected data format from server.");
          return;
        }

        // Filter for doctors with available slots and take the first 'limit'
        const now = new Date();
        const filteredAndLimitedDoctors = doctorsData
          .filter(
            (doctor) =>
              doctor.availability &&
              Array.isArray(doctor.availability) && // Ensure it's an array
              doctor.availability.some((slot) => new Date(slot.date) >= now) // Check for future availability
          )
          .slice(0, limit); // Limit the number of doctors

        setAvailableDoctors(filteredAndLimitedDoctors);
      } catch (err) {
        console.error("AvailableDoctorsWidget: Error fetching doctors:", err);
        setError("Failed to load available doctors.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [limit, API_BASE_URL]); // Re-run if the limit prop or API_BASE_URL changes

  if (loading) {
    return (
      <div className="text-center text-gray-600 p-4">
        Loading available doctors...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 text-center p-4">Error: {error}</div>;
  }

  if (availableDoctors.length === 0) {
    return (
      <div className="text-gray-600 p-4">
        No doctors are currently available for booking.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        Quick Book: Available Doctors
      </h3>
      <div className="grid grid-cols-1 gap-4">
        {availableDoctors.map((doctor) => (
          <div
            key={doctor._id}
            className="flex flex-col items-start space-x-3 p-3 border rounded-lg shadow-sm bg-gray-50"
          >
            <img
              src={
                doctor.user_id?.image || // Access nested user_id for image
                "https://via.placeholder.com/60/007bff/ffffff?text=DR" // Fallback image
              }
              alt={doctor.user_id?.name || "Doctor"}
              className="w-16 h-16 rounded-full object-cover border-2 border-blue-400"
            />
            <div className="flex-grow">
              <h4 className="font-bold text-lg text-gray-900">
                Dr. {doctor.user_id?.name || "N/A"}
              </h4>
              <p className="text-blue-600 text-sm">
                {doctor.specialization || "General"}
              </p>
              <p className="text-gray-500 text-xs">
                {doctor.availability.length > 0
                  ? `Next: ${new Date(
                      doctor.availability[0].date
                    ).toLocaleDateString()}`
                  : "No immediate availability"}
              </p>
            </div>
            <Link
              to={`/BookingPage?doctorId=${doctor.user_id._id}`} // Pass doctorId via query parameter
              className="btn btn-primary btn-sm bg-blue-200 hover:bg-purple-800 text-white hover:text-white px-3 py-1 rounded-md text-sm"
            >
              Book Now
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
