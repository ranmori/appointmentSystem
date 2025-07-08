import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import GetUserInfo from "../utils/GetUserInfo.jsx"; // Utility to get user info and token
import { FaEdit, FaTrashAlt, FaTimes, FaCheck } from "react-icons/fa"; // Icons for edit, delete, close, save

// Custom Modal Component (reused from UserManagement for consistency)
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

export default function DoctorManagement() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [editingDoctor, setEditingDoctor] = useState(null); // Doctor object being edited
  const [formData, setFormData] = useState({}); // Form data for editing
  const [showEditModal, setShowEditModal] = useState(false); // State for edit modal visibility
  const [showStatusModal, setShowStatusModal] = useState(false); // State for status/message modal
  const [modalMessage, setModalMessage] = useState(""); // Message for the status modal
  const [isSuccessModal, setIsSuccessModal] = useState(false); // Type of status modal (success/error)

  // Define API_BASE_URL using environment variable
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3022";

  // Fetch doctors from the backend
  const fetchDoctors = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userInfo = await GetUserInfo();
      if (!userInfo || !userInfo.token || userInfo.role !== "admin") {
        console.warn(
          "DoctorManagement: Not authorized or not logged in as admin. Redirecting."
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
      // Fetch all doctors. The /api/doctors endpoint is now protected for admin viewing.
      const response = await axios.get(`${API_BASE_URL}/api/doctors`, config);
      setDoctors(response.data);
    } catch (err) {
      console.error("DoctorManagement: Error fetching doctors:", err);
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        setError("Unauthorized access. Please log in as an administrator.");
        navigate("/login");
      } else {
        setError("Failed to load doctors. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, navigate]);

  useEffect(() => {
    fetchDoctors();
  }, [navigate, fetchDoctors]);

  // Handle opening the edit modal
  const handleEditClick = (doctor) => {
    setEditingDoctor(doctor);
    setModalMessage("");
    setIsSuccessModal(false);
    setFormData({
      specialization: doctor.specialization || "",
      // Note: Doctor's user details (username, email, etc.) are edited via User Management.
      // This modal focuses on Dr-specific profile fields like specialization.
    });
    setShowEditModal(true);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle saving doctor changes
  const handleSave = async () => {
    if (!editingDoctor || !token) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const payload = { ...formData };

      // Patch the doctor's profile (specialization, availability if needed)
      await axios.patch(
        `${API_BASE_URL}/api/doctors/${editingDoctor._id}`,
        payload,
        config
      );

      setModalMessage("Doctor profile updated successfully!");
      setIsSuccessModal(true);
      setShowStatusModal(true);
      setShowEditModal(false);
      setEditingDoctor(null);
      fetchDoctors(); // Refresh the doctor list
    } catch (err) {
      console.error("DoctorManagement: Error updating doctor:", err);
      setModalMessage(
        err.response?.data?.error ||
          "Failed to update doctor profile. Please try again."
      );
      setIsSuccessModal(false);
      setShowStatusModal(true);
    }
  };

  // Handle deleting a doctor
  const handleDelete = async (doctorId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this doctor? This will also delete their associated user account and appointments."
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
      // Deleting a doctor profile will also delete the associated user and appointments on the backend
      await axios.delete(`${API_BASE_URL}/api/doctors/${doctorId}`, config);

      setModalMessage(
        "Doctor and associated user/appointments deleted successfully!"
      );
      setIsSuccessModal(true);
      setShowStatusModal(true);
      fetchDoctors(); // Refresh the doctor list
    } catch (err) {
      console.error("DoctorManagement: Error deleting doctor:", err);
      setModalMessage(
        err.response?.data?.error ||
          "Failed to delete doctor. Please try again."
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
        <p className="text-xl text-gray-600">Loading doctors...</p>
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Doctors</h1>

      {doctors.length === 0 ? (
        <p className="text-gray-600 text-lg text-center">No doctors found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md p-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {doctors.map((doctor) => (
                <tr key={doctor._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {doctor.user_id?.username || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doctor.user_id?.email || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doctor.specialization || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditClick(doctor)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      title="Edit Doctor"
                    >
                      <FaEdit className="inline-block w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(doctor._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Doctor"
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

      {/* Edit Doctor Modal (using CustomModal component) */}
      <CustomModal
        isOpen={showEditModal}
        onClose={() => {
          setEditingDoctor(null);
          setShowEditModal(false);
        }}
        title={
          editingDoctor
            ? `Edit Doctor: ${editingDoctor.user_id?.username || "N/A"}`
            : ""
        }
      >
        {editingDoctor && (
          <form className="space-y-4">
            <div>
              <label
                htmlFor="specialization"
                className="block text-sm font-medium text-gray-700"
              >
                Specialization
              </label>
              <input
                type="text"
                id="specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            {/* Add other doctor-specific fields here if needed, e.g., availability management */}
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
