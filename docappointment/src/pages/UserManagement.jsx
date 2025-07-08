import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import GetUserInfo from "../utils/GetUserInfo.jsx"; // Utility to get user info and token
import { FaEdit, FaTrashAlt, FaTimes, FaCheck } from "react-icons/fa"; // Icons for edit, delete, close, save

// Custom Modal Component (extracted for reusability and cleaner code)
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
          {/* Show Save/Cancel buttons only if children (form) are present, otherwise just Close */}
          {children ? (
            <>
              <button
                onClick={onClose} // Close handler from parent
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

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [editingUser, setEditingUser] = useState(null); // User object being edited
  const [formData, setFormData] = useState({}); // Form data for editing
  const [showEditModal, setShowEditModal] = useState(false); // State for edit modal visibility
  const [showStatusModal, setShowStatusModal] = useState(false); // State for status/message modal
  const [modalMessage, setModalMessage] = useState(""); // Message for the status modal
  const [isSuccessModal, setIsSuccessModal] = useState(false); // Type of status modal (success/error)


  // api base url
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3022";

  // Fetch users from the backend
  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userInfo = await GetUserInfo();
      if (!userInfo || !userInfo.token || userInfo.role !== "admin") {
        console.warn(
          "UserManagement: Not authorized or not logged in as admin. Redirecting."
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
      const response = await axios.get(
        `${API_BASE_URL}/api/users`,
        config
      );
      setUsers(response.data);
    } catch (err) {
      console.error("UserManagement: Error fetching users:", err);
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        setError("Unauthorized access. Please log in as an administrator.");
        // Consider clearing token if 401/403 on initial load, but GetUserInfo should handle that
        navigate("/login");
      } else {
        setError("Failed to load users. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, navigate]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle opening the edit modal
  const handleEditClick = (user) => {
    setEditingUser(user);
    // Reset modal message states when opening a new edit modal
    setModalMessage("");
    setIsSuccessModal(false);
    // Initialize form data with current user details, excluding password
    setFormData({
      username: user.username,
      email: user.email,
      name: user.name || "",
      location: user.location || "",
      image: user.image || "",
      role: user.role,
      specialization: user.doctorProfile?.specialization || "", // For doctors
      password: "", // Password field is always empty for security
    });
    setShowEditModal(true);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle saving user changes
  const handleSave = async () => {
    if (!editingUser || !token) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const payload = { ...formData };
      // Only send password if it's actually set (i.e., user typed something)
      if (!payload.password) {
        delete payload.password;
      }
      // If role is not doctor, ensure specialization is not sent
      if (payload.role !== "doctor") {
        delete payload.specialization;
      }

      await axios.patch(
        `${API_BASE_URL}/api/users/${editingUser._id}`,
        payload,
        config
      );

      setModalMessage("User updated successfully!");
      setIsSuccessModal(true);
      setShowStatusModal(true); // Show status modal
      setShowEditModal(false); // Close edit modal
      setEditingUser(null); // Clear editing user
      fetchUsers(); // Refresh the user list
    } catch (err) {
      console.error("UserManagement: Error updating user:", err);
      setModalMessage(
        err.response?.data?.error || "Failed to update user. Please try again."
      );
      setIsSuccessModal(false);
      setShowStatusModal(true); // Show status modal
    }
  };

  // Handle deleting a user
  const handleDelete = async (userId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
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
      await axios.delete(`${API_BASE_URL}/api/users/${userId}`, config);

      setModalMessage("User deleted successfully!");
      setIsSuccessModal(true);
      setShowStatusModal(true); // Show status modal
      fetchUsers(); // Refresh the user list
    } catch (err) {
      console.error("UserManagement: Error deleting user:", err);
      setModalMessage(
        err.response?.data?.error || "Failed to delete user. Please try again."
      );
      setIsSuccessModal(false);
      setShowStatusModal(true); // Show status modal
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
        <p className="text-xl text-gray-600">Loading users...</p>
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Users</h1>

      {users.length === 0 ? (
        <p className="text-gray-600 text-lg text-center">No users found.</p>
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
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.name || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.location || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditClick(user)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      title="Edit User"
                    >
                      <FaEdit className="inline-block w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete User"
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

      {/* Edit User Modal (using CustomModal component) */}
      <CustomModal
        isOpen={showEditModal}
        onClose={() => {
          setEditingUser(null);
          setShowEditModal(false);
        }} // Close edit modal
        title={editingUser ? `Edit User: ${editingUser.username}` : ""}
        // No message prop here, as messages are handled by the separate status modal
      >
        {editingUser && (
          <form className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700"
              >
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700"
              >
                Image URL (or Base64)
              </label>
              <input
                type="text"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="patient">patient</option>
                <option value="doctor">doctor</option>
                <option value="admin">admin</option>
              </select>
            </div>
            {formData.role === "doctor" && (
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
            )}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                New Password (leave blank to keep current)
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="********"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button" // Important: type="button" to prevent form submission
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
