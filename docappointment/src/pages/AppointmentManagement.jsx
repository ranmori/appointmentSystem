import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import GetUserInfo from "../utils/GetUserInfo.jsx"; // Utility to get user info and token
import { FaEdit, FaTrashAlt, FaTimes, FaCheck } from "react-icons/fa"; // Icons for edit, delete, close, save

// Custom Modal Component (reused for consistency across admin pages)
const CustomModal = ({
  isOpen,
  onClose,
  title,
  message,
  isSuccess,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        {message && (
          <div
            className={`p-3 mb-4 rounded-md ${
              isSuccess
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}
        {title && (
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
        )}
        {children} {/* This is where the form content will go */}
        <div className="mt-6 flex justify-end space-x-3">
          {children ? (
            <>
              <button
                onClick={onClose}
                className="flex items-center px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
              >
                <FaTimes className="mr-2" /> Cancel
              </button>
              {/* Save button will be passed as part of children or handled by parent */}
            </>
          ) : (
            <button
              onClick={onClose}
              className={`flex items-center px-4 py-2 rounded-md transition-colors 
                ${
                  isSuccess
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }
              `}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AppointmentManagement() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null); // Appointment object being edited
  const [formData, setFormData] = useState({}); // Form data for editing (e.g., status)
  const [showEditModal, setShowEditModal] = useState(false); // State for edit modal visibility
  const [showStatusModal, setShowStatusModal] = useState(false); // State for status/message modal
  const [modalMessage, setModalMessage] = useState(""); // Message for the status modal
  const [isSuccessModal, setIsSuccessModal] = useState(false); // Type of status modal (success/error)

  // Helper to format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  // base url
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3022";

  // Fetch appointments from the backend
  const fetchAppointments = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userInfo = await GetUserInfo();
      if (!userInfo || !userInfo.token || userInfo.role !== "admin") {
        console.warn(
          "AppointmentManagement: Not authorized or not logged in as admin. Redirecting."
        );
        navigate(userInfo ? "/dashboard" : "/login"); // Redirect non-admins or unauthenticated
        return;
      }
      setToken(userInfo.token);

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      // Fetch all appointments using the admin-specific endpoint
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/appointments`,
        config
      );
      setAppointments(response.data);
    } catch (err) {
      console.error("AppointmentManagement: Error fetching appointments:", err);
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        setError("Unauthorized access. Please log in as an administrator.");
        navigate("/login");
      } else {
        setError("Failed to load appointments. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, navigate]);

  useEffect(() => {
    fetchAppointments();
  }, [navigate, fetchAppointments]);

  // Handle opening the edit modal
  const handleEditClick = (appointment) => {
    setEditingAppointment(appointment);
    setModalMessage("");
    setIsSuccessModal(false);
    setFormData({
      status: appointment.status,
      // You can add other editable fields here if needed (e.g., notes, symptoms)
      // For now, focusing on status
    });
    setShowEditModal(true);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle saving appointment changes (specifically status)
  const handleSave = async () => {
    if (!editingAppointment || !token) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const payload = { status: formData.status }; // Only sending status for now

      await axios.patch(
        `${API_BASE_URL}/api/admin/appointments/${editingAppointment._id}/status`,
        payload,
        config
      );

      setModalMessage("Appointment status updated successfully!");
      setIsSuccessModal(true);
      setShowStatusModal(true);
      setShowEditModal(false);
      setEditingAppointment(null);
      fetchAppointments(); // Refresh the appointment list
    } catch (err) {
      console.error("AppointmentManagement: Error updating appointment:", err);
      setModalMessage(
        err.response?.data?.error ||
          "Failed to update appointment status. Please try again."
      );
      setIsSuccessModal(false);
      setShowStatusModal(true);
    }
  };

  // Handle deleting an appointment
  const handleDelete = async (appointmentId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this appointment? This action cannot be undone."
      )
    ) {
      return; // User cancelled
    }
    if (!token) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.delete(
        `${API_BASE_URL}/api/admin/appointments/${appointmentId}`,
        config
      );

      setModalMessage("Appointment deleted successfully!");
      setIsSuccessModal(true);
      setShowStatusModal(true);
      fetchAppointments(); // Refresh the appointment list
    } catch (err) {
      console.error("AppointmentManagement: Error deleting appointment:", err);
      setModalMessage(
        err.response?.data?.error ||
          "Failed to delete appointment. Please try again."
      );
      setIsSuccessModal(false);
      setShowStatusModal(true);
    }
  };

  // Close status modal handler
  const closeStatusModal = () => {
    setShowStatusModal(false);
    setModalMessage("");
    setIsSuccessModal(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl text-gray-600">Loading appointments...</p>
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

  return (
    <div className="p-6 space-y-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Manage Appointments
      </h1>

      {appointments.length === 0 ? (
        <p className="text-gray-600 text-lg text-center">
          No appointments found.
        </p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md p-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {appointment.patient_Id?.username || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {appointment.dr_id?.user_id?.username || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(appointment.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {appointment.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {appointment.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditClick(appointment)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      title="Edit Status"
                    >
                      <FaEdit className="inline-block w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(appointment._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Appointment"
                    >
                      <FaTrashAlt className="inline-block w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Appointment Modal (using CustomModal component) */}
      <CustomModal
        isOpen={showEditModal}
        onClose={() => {
          setEditingAppointment(null);
          setShowEditModal(false);
        }}
        title={
          editingAppointment
            ? `Edit Appointment Status for ${
                editingAppointment.patient_Id?.username || "N/A"
              } with ${editingAppointment.dr_id?.user_id?.username || "N/A"}`
            : ""
        }
      >
        {editingAppointment && (
          <form className="space-y-4">
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="pending">pending</option>
                <option value="booked">booked</option>
                <option value="cancelled">cancelled</option>
                <option value="completed">completed</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FaCheck className="mr-2" /> Save Changes
              </button>
            </div>
          </form>
        )}
      </CustomModal>

      {/* Status/Message Modal (for success/error messages after save/delete) */}
      <CustomModal
        isOpen={showStatusModal}
        onClose={closeStatusModal}
        message={modalMessage}
        isSuccess={isSuccessModal}
      />
    </div>
  );
}
