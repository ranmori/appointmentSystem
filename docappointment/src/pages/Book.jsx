import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import SearchInput from "../components/SearchInput.jsx"; // Import the reusable SearchInput component

export default function Book() {
  const navigate = useNavigate(); // Initialize useNavigate hook
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [availableDrs, setAvailableDrs] = useState([]);
  const [error, setError] = useState("");

  // Define API_BASE_URL using environment variable
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3022";

  useEffect(() => {
    const getDrs = async () => {
      try {
        setLoading(true);
        setError(""); // Clear previous errors

        console.log("Book.jsx: Attempting to fetch doctors from API...");
        const response = await axios.get(`${API_BASE_URL}/api/doctors`);

        console.log("Book.jsx: Full API response for doctors:", response);
        console.log("Book.jsx: API response data for doctors:", response.data);

        if (Array.isArray(response.data)) {
          setAvailableDrs(response.data);
          console.log(
            "Book.jsx: Doctors set successfully (it was a direct array)."
          );
        } else if (
          response.data &&
          typeof response.data === "object" &&
          Array.isArray(response.data.doctors)
        ) {
          setAvailableDrs(response.data.doctors);
          console.log(
            "Book.jsx: Doctors set successfully (from nested 'doctors' array)."
          );
        } else {
          console.warn(
            "Book.jsx: API returned non-array or unexpected format for doctors:",
            response.data
          );
          setAvailableDrs([]);
          setError(
            "Failed to load doctors. The server returned an unexpected format."
          );
        }
      } catch (err) {
        console.error("Book.jsx: Error fetching doctors:", err);
        if (
          err.response &&
          err.response.data &&
          (err.response.data.message || err.response.data.error)
        ) {
          setError(err.response.data.message || err.response.data.error);
        } else {
          setError(
            "Failed to fetch doctors. Please check your network or backend server."
          );
        }
      } finally {
        setLoading(false);
      }
    };
    getDrs();
  }, [API_BASE_URL]); // Empty dependency array as search is now handled by filtering

  // Filter doctors based on search input (now just a local filter)
  const filteredDoctors = Array.isArray(availableDrs)
    ? availableDrs.filter(
        (doctor) =>
          (doctor.specialization &&
            doctor.specialization
              .toLowerCase()
              .includes(searchInput.toLowerCase())) ||
          (doctor.user_id &&
            doctor.user_id.name &&
            doctor.user_id.name
              .toLowerCase()
              .includes(searchInput.toLowerCase()))
      )
    : [];

  // This function will be passed to the SearchInput component
  const handleSearch = (term) => {
    setSearchInput(term);
    // If your search was complex or involved backend calls, you'd trigger them here.
  };

  return (
    <div className="container mx-auto p-4">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
        Book an Appointment
      </h1>

      {/* Search Input - Using the reusable component */}
      <SearchInput
        onSearch={handleSearch}
        placeholder="Search doctors by name or specialization..."
      />

      {/* Loading and Error States */}
      {loading && (
        <div className="text-center text-gray-600">Loading doctors...</div>
      )}
      {error && <div className="text-red-500 text-center">{error}</div>}

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 mt-10 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!loading && !error && filteredDoctors.length > 0
          ? filteredDoctors.map((doctor) => (
              <div
                key={doctor._id}
                className="card bg-white text-black shadow-xl rounded-lg overflow-hidden"
              >
                <figure className="px-4 pt-4">
                  <img
                    src={
                      doctor.user_id?.image ||
                      "https://via.placeholder.com/150/007bff/ffffff?text=Doctor"
                    } // Updated fallback
                    alt={doctor.user_id?.name || "Doctor"}
                    className="rounded-xl h-48 w-full object-cover"
                  />
                </figure>
                <div className="card-body p-6">
                  <h2 className="card-title text-xl font-semibold mb-2">
                    Dr. {doctor.user_id?.name || "N/A"}
                    <div className="badge badge-secondary ml-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {" "}
                      {/* Added Tailwind styling */}
                      {doctor.specialization || "N/A"}
                    </div>
                  </h2>
                  <div className="text-gray-700 text-sm space-y-1 mb-4">
                    <p className="flex items-center">
                      <span className="font-semibold mr-1">Availability:</span>
                      {doctor.availability && doctor.availability.length > 0
                        ? ` Next available: ${new Date(
                            doctor.availability[0].date
                          ).toLocaleDateString()}`
                        : " No availability"}
                    </p>
                    <p className="flex items-center">
                      <span className="font-semibold mr-1">Location:</span>
                      {doctor.user_id?.location || "Not specified"}
                    </p>
                  </div>
                  <div className="card-actions justify-end">
                    <button
                      className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-medium transition duration-200"
                      // --- CRITICAL FIX: Use navigate for client-side routing and pass doctorId ---
                      onClick={() =>
                        navigate(`/BookingPage?doctorId=${doctor.user_id._id}`)
                      }
                      // --- END CRITICAL FIX ---
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))
          : !loading &&
            !error &&
            filteredDoctors.length === 0 && (
              <div className="md:col-span-3 text-center text-gray-600 py-8">
                No doctors found matching your search.
              </div>
            )}
      </div>
    </div>
  );
}
