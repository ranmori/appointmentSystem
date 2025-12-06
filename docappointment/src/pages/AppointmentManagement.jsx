import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import GetUserInfo from "../utils/GetUserInfo.jsx";
import { FaEdit, FaTrashAlt, FaTimes, FaCheck } from "react-icons/fa";

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
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border-2 border-teal-100">
        {message && (
          <div
            className={`p-4 mb-5 rounded-xl border-l-4 ${
              isSuccess
                ? "bg-green-50 text-green-700 border-green-400"
                : "bg-red-50 text-red-700 border-red-400"
            }`}
          >
            {message}
          </div>
        )}
        {title && (
          <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-6">
            {title}
          </h2>
        )}
        {children}
        <div className="mt-6 flex justify-end space-x-3">
          {children ? (
            <button
              onClick={onClose}
              className="flex items-center px-5 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
            >
              <FaTimes className="mr-2" /> Cancel
            </button>
          ) : (
            <button
              onClick={onClose}
              className={`flex items-center px-5 py-2.5 rounded-xl transition-colors font-semibold
                ${
                  isSuccess
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
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
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formData, setFormData] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isSuccessModal, setIsSuccessModal] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3022";

  const fetchAppointments = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userInfo = await GetUserInfo();
      if (!userInfo || !userInfo.token || userInfo.role !== "admin") {
        console.warn(
          "AppointmentManagement: Not authorized or not logged in as admin. Redirecting."
        );
        navigate(userInfo ? "/dashboard" : "/login");
        return;
      }
      setToken(userInfo.token);

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
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

  const handleEditClick = (appointment) => {
    setEditingAppointment(appointment);
    setModalMessage("");
    setIsSuccessModal(false);
    setFormData({
      status: appointment.status,
    });
    setShowEditModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!editingAppointment || !token) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const payload = { status: formData.status };

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
      fetchAppointments();
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

  const handleDelete = async (appointmentId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this appointment? This action cannot be undone."
      )
    ) {
      return;
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
      fetchAppointments();
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

  const closeStatusModal = () => {
    setShowStatusModal(false);
    setModalMessage("");
    setIsSuccessModal(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xl text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-6 rounded-xl">
          <p className="text-xl font-semibold">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 min-h-screen">
      <div className="bg-white rounded-2xl shadow-md p-6 border border-teal-100">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-6">
          Manage Appointments
        </h1>

        {appointments.length === 0 ? (
          <p className="text-gray-600 text-lg text-center py-8">
            No appointments found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-teal-50 to-cyan-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-teal-700 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-teal-700 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-teal-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-teal-700 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-teal-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-teal-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {appointments.map((appointment) => (
                  <tr key={appointment._id} className="hover:bg-teal-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {appointment.patient_Id?.username || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {appointment.dr_id?.user_id?.username || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatDate(appointment.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {appointment.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-3 py-1 rounded-full font-semibold ${
                          appointment.status === "booked"
                            ? "bg-green-100 text-green-700"
                            : appointment.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(appointment)}
                        className="text-teal-600 hover:text-teal-800 mr-4 transition-colors"
                        title="Edit Status"
                      >
                        <FaEdit className="inline-block w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(appointment._id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
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
      </div>

      {/* Edit Modal */}
      <CustomModal
        isOpen={showEditModal}
        onClose={() => {
          setEditingAppointment(null);
          setShowEditModal(false);
        }}
        title={
          editingAppointment
            ? `Edit Appointment Status`
            : ""
        }
      >
        {editingAppointment && (
          <form className="space-y-5">
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 rounded-xl shadow-sm p-3 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all"
              >
                <option value="pending">pending</option>
                <option value="booked">booked</option>
                <option value="cancelled">cancelled</option>
                <option value="completed">completed</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all font-semibold shadow-md"
              >
                <FaCheck className="mr-2" /> Save Changes
              </button>
            </div>
          </form>
        )}
      </CustomModal>

      {/* Status Modal */}
      <CustomModal
        isOpen={showStatusModal}
        onClose={closeStatusModal}
        message={modalMessage}
        isSuccess={isSuccessModal}
      />
    </div>
  );
}