import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import GetUserInfo from "../utils/GetUserInfo.jsx"; // Assuming this path is correct

export default function Appointments() {
  // Renamed from AppointmentsPage to Appointments
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // States for cancellation confirmation modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [cancelError, setCancelError] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false); // Loading state for cancellation process

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3022";
  useEffect(() => {
    const fetchAllAppointments = async () => {
      try {
        setLoading(true);
        setError(null);

        const userInfo = await GetUserInfo();
        if (!userInfo || !userInfo.token) {
          console.log(
            "Appointments: No user info or token found, redirecting to login."
          );
          navigate("/login");
          return;
        }
        setUser(userInfo);

        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const response = await axios.get(
          `${API_BASE_URL}/api/appointments`,
          config
        );

        console.log(
          "Appointments: API response for all appointments:",
          response.data
        );

        if (Array.isArray(response.data)) {
          setAppointments(response.data);
        } else if (
          response.data &&
          typeof response.data === "object" &&
          Array.isArray(response.data.appointments)
        ) {
          setAppointments(response.data.appointments);
        } else {
          console.warn(
            "Appointments: Unexpected API response format:",
            response.data
          );
          setAppointments([]);
          setError(
            "Failed to load appointments. The server returned an unexpected format."
          );
        }
      } catch (err) {
        console.error("Appointments: Error fetching appointments:", err);
        if (err.response && err.response.status === 401) {
          console.log(
            "Appointments: API call Unauthorized, redirecting to login."
          );
          localStorage.removeItem("token");
          localStorage.removeItem("username");
          localStorage.removeItem("userInfo");
          navigate("/login");
        } else if (
          err.response &&
          err.response.data &&
          (err.response.data.message || err.response.data.error)
        ) {
          setError(err.response.data.message || err.response.data.error);
        } else {
          setError(
            "Failed to fetch appointments. Please check your network or try again."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllAppointments();
  }, [API_BASE_URL, navigate]);

  const isDoctor = user?.role === "doctor";

  // Function to show the cancellation confirmation modal
  const confirmCancel = (appointment) => {
    setAppointmentToCancel(appointment);
    setShowCancelModal(true);
    setCancelError(null); // Clear any previous cancellation errors
  };

  // Function to handle the actual cancellation API call
  const handleCancelAppointment = async () => {
    if (!appointmentToCancel || !user || !user.token) {
      setCancelError("Error: Missing appointment data or user token.");
      return;
    }

    setIsCancelling(true); // Set loading state
    setCancelError(null); // Clear any previous errors

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      // --- CRITICAL FIX: Use axios.patch and the correct backend path ---
      const response = await axios.patch(
        `${API_BASE_URL}/api/appointments/${appointmentToCancel._id}/cancel`,
        {}, // PATCH typically sends a body, but for cancel, it might be empty or just {status: 'cancelled'}
        config
      );
      // --- END CRITICAL FIX ---

      console.log("Appointment cancelled successfully:", response.data);

      // Update local state: find the cancelled appointment and change its status
      // Use response.data if your backend returns the updated appointment
      setAppointments((prevAppointments) =>
        prevAppointments.map((appt) =>
          appt._id === appointmentToCancel._id
            ? { ...appt, status: "cancelled" }
            : appt
        )
      );

      setShowCancelModal(false); // Close the modal
      setAppointmentToCancel(null); // Clear the appointment from state
      // Instead of browser alert, consider a temporary success message on the page
      alert("Appointment cancelled successfully!");
    } catch (err) {
      console.error("Error cancelling appointment:", err);
      let errorMessage = "Failed to cancel appointment.";
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage =
            "Session expired or unauthorized. Please log in again.";
          localStorage.removeItem("token");
          localStorage.removeItem("username");
          localStorage.removeItem("userInfo");
          navigate("/login");
        } else {
          errorMessage =
            err.response.data.error ||
            err.response.data.message ||
            errorMessage;
        }
      } else if (err.request) {
        errorMessage = "Network error. Could not reach the server.";
      }
      setCancelError(errorMessage); // Display error in modal
    } finally {
      setIsCancelling(false); // End loading state
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "booked":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading your appointments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-red-600">
        <p className="text-xl">Error: {error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-10">
            Your Appointments
          </h1>

          {appointments.length === 0 ? (
            <div className="text-center text-gray-600 text-lg py-10">
              <p className="mb-4">You have no appointments yet.</p>
              {!isDoctor && (
                <Link
                  to="/book"
                  className="btn btn-primary bg-blue-300 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-semibold transition"
                >
                  Book Your First Appointment
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {appointments
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((appointment) => (
                  <div
                    key={appointment._id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-lg shadow-md bg-white border border-gray-200 hover:shadow-lg transition duration-200 ease-in-out"
                  >
                    <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                      <img
                        src={
                          isDoctor
                            ? appointment.patient_Id?.image ||
                              "/default-patient-avatar.png"
                            : appointment.dr_id?.user_id?.image ||
                              "/default-doctor-avatar.png"
                        }
                        alt={
                          isDoctor
                            ? appointment.patient_Id?.username || "Patient"
                            : appointment.dr_id?.user_id?.name || "Doctor"
                        }
                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-400"
                      />
                      <div>
                        <div className="text-xl font-semibold text-gray-900">
                          {isDoctor
                            ? appointment.patient_Id?.username || "Patient N/A"
                            : `Dr. ${
                                appointment.dr_id?.user_id?.name || "Doctor N/A"
                              }`}
                        </div>
                        <div className="text-sm text-gray-600">
                          {isDoctor
                            ? `Email: ${appointment.patient_Id?.email || "N/A"}`
                            : appointment.dr_id?.specialization ||
                              "Specialization N/A"}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-md">
                      <div className="flex flex-col items-center">
                        <span className="text-gray-600 text-sm">Date:</span>
                        <span className="font-bold text-gray-800">
                          {new Date(appointment.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-gray-600 text-sm">Time:</span>
                        <span className="font-bold text-gray-800">
                          {appointment.time}
                        </span>
                      </div>
                      {appointment.duration && (
                        <div className="flex flex-col items-center">
                          <span className="text-gray-600 text-sm">
                            Duration:
                          </span>
                          <span className="font-bold text-gray-800">
                            {appointment.duration} mins
                          </span>
                        </div>
                      )}
                      <span
                        className={`px-4 py-1.5 text-sm rounded-full font-semibold ${getStatusClasses(
                          appointment.status
                        )}`}
                      >
                        {appointment.status.charAt(0).toUpperCase() +
                          appointment.status.slice(1)}
                      </span>
                    </div>

                    {/* --- Updated Cancel Button --- */}
                    {appointment.status === "booked" &&
                      !isDoctor && ( // Only patients can cancel 'booked'
                        <button
                          className="btn btn-sm bg-red-500 hover:bg-red-600 text-white rounded-md px-3 py-1.5 ml-2 transition-colors duration-200"
                          onClick={() => confirmCancel(appointment)} // Call confirmation handler
                          disabled={isCancelling} // Disable button while cancelling
                        >
                          {isCancelling &&
                          appointmentToCancel?._id === appointment._id
                            ? "Cancelling..."
                            : "Cancel"}
                        </button>
                      )}
                    {/* --- END Updated Cancel Button --- */}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* --- Cancellation Confirmation Modal --- */}
        {showCancelModal && appointmentToCancel && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl max-w-sm w-full">
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                Confirm Cancellation
              </h3>
              {cancelError && (
                <p className="text-red-500 text-sm mb-3">{cancelError}</p>
              )}
              <p className="text-gray-700 mb-6">
                Are you sure you want to cancel your appointment with{" "}
                <span className="font-semibold">
                  Dr. {appointmentToCancel.dr_id?.user_id?.name || "N/A"}
                </span>{" "}
                on{" "}
                <span className="font-semibold">
                  {new Date(appointmentToCancel.date).toLocaleDateString()}
                </span>{" "}
                at{" "}
                <span className="font-semibold">
                  {appointmentToCancel.time}
                </span>
                ?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                  onClick={() => setShowCancelModal(false)} // Close modal without cancelling
                  disabled={isCancelling}
                >
                  No, Keep It
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                  onClick={handleCancelAppointment} // Call cancellation logic
                  disabled={isCancelling}
                >
                  {isCancelling ? "Cancelling..." : "Yes, Cancel"}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* --- END Cancellation Confirmation Modal --- */}
      </div>
    </>
  );
}
