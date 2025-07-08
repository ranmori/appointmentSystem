import React, { useState, useEffect } from "react";
import axios from "axios";

export default function DoctorList() {
  const [doctorList, setDoctorList] = useState([]); // Corrected typo: setDocotorList -> setDoctorList
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state

  // Define API_BASE_URL using environment variable
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3022";

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true); // Start loading
        setError(false); // Clear any previous errors

        // IMPORTANT: Use the full backend URL for your API call
        // e.g., "http://localhost:3022/api/doctors"
        console.log("DoctorList.jsx: Fetching doctors from API...");
        const res = await axios.get(`${API_BASE_URL}/api/doctors`); // Use full URL

        console.log("DoctorList.jsx: API response data:", res.data);

        // Check if the response data is an array or contains a 'doctors' array
        let doctorsData = [];
        if (Array.isArray(res.data)) {
          doctorsData = res.data;
        } else if (res.data && Array.isArray(res.data.doctors)) {
          doctorsData = res.data.doctors; // If backend returns { doctors: [...] }
        } else {
          console.warn(
            "DoctorList.jsx: Unexpected API response format:",
            res.data
          );
          setError(true); // Set error for unexpected format
          return; // Stop execution if data is not in expected format
        }

        setDoctorList(doctorsData);
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError(true);
      } finally {
        setLoading(false); // End loading
      }
    };
    fetchDoctors();
  }, [API_BASE_URL]);

  // --- Filtering Logic ---
  const availableDoctors = doctorList.filter((doctor) => {
    // A doctor is available if their 'availability' array is not empty
    // and ideally contains future dates/times.
    // For simplicity, we'll just check if the array has any entries.
    // You might want more sophisticated logic here (e.g., checking if dates are in the future)
    return doctor.availability && doctor.availability.length > 0;
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
        Available Doctors
      </h1>

      {loading && (
        <div className="text-center text-gray-600 text-lg">
          Loading doctors...
        </div>
      )}

      {error && !loading && (
        <div className="text-red-600 text-center text-lg mt-4">
          Failed to load doctors. Please try again later.
        </div>
      )}

      {!loading && !error && availableDoctors.length === 0 ? (
        <div className="text-center text-gray-600 text-lg mt-4">
          No available doctors at the moment. Please check back later!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {availableDoctors.map((doctor) => (
            <div
              key={doctor._id}
              className="card bg-white text-gray-900 shadow-lg rounded-xl overflow-hidden transform hover:scale-105 transition duration-300 ease-in-out"
            >
              <figure className="relative h-48 w-full">
                <img
                  src={
                    doctor.user_id?.image || // Access nested user_id for image
                    "https://via.placeholder.com/150/007bff/ffffff?text=Doctor" // Fallback image
                  }
                  alt={doctor.user_id?.name || "Doctor"} // Access nested user_id for name
                  className="object-cover w-full h-full"
                />
                <div className="absolute top-0 left-0 bg-blue-600 text-white px-3 py-1 rounded-br-lg text-sm font-semibold">
                  Available
                </div>
              </figure>
              <div className="card-body p-6">
                <h2 className="card-title text-2xl font-semibold mb-2">
                  Dr. {doctor.user_id?.name || "N/A"}
                </h2>
                <p className="text-blue-600 font-medium text-lg mb-2">
                  {doctor.specialization || "General Practitioner"}
                </p>
                <div className="text-gray-700 text-sm mb-4">
                  <p className="flex items-center mb-1">
                    <svg
                      className="w-4 h-4 mr-2 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    {doctor.availability.length} slots available
                  </p>
                  <p className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    {doctor.user_id?.location || "Not specified"}
                  </p>
                </div>
                <button
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
                  onClick={() =>
                    (window.location.href = `/BookingPage?doctorId=${doctor.user_id._id}`)
                  }
                >
                  Book Appointment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
