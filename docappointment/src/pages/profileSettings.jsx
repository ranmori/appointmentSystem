import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import GetUserInfo from "../utils/GetUserInfo.jsx";

export default function ProfileSettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    name: "",
    location: "",
    image: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentImage, setCurrentImage] = useState(
    "https://via.placeholder.com/150/14b8a6/ffffff?text=No+Image"
  );
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3022";

  useEffect(() => {
    const loadUserInfo = async () => {
      const userInfo = await GetUserInfo();
      if (!userInfo || !userInfo.token) {
        navigate("/login");
      } else {
        setUser(userInfo);
        setFormData({
          username: userInfo.username || "",
          email: userInfo.email || "",
          name: userInfo.name || "",
          location: userInfo.location || "",
          image: userInfo.image || "",
        });
        setCurrentImage(
          userInfo.image ||
            "https://via.placeholder.com/150/14b8a6/ffffff?text=No+Image"
        );
      }
      setLoadingUser(false);
    };
    loadUserInfo();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setMessage("Image file size exceeds 2MB limit.");
        setMessageType("error");
        setImageFile(null);
        setImagePreview(null);
        setFormData((prevData) => ({ ...prevData, image: currentImage }));
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prevData) => ({ ...prevData, image: reader.result }));
      };
      reader.onerror = () => {
        console.error("Error reading file.");
        setMessage("Failed to read image file.");
        setMessageType("error");
        setImageFile(null);
        setImagePreview(null);
        setFormData((prevData) => ({ ...prevData, image: currentImage }));
      };
      reader.readAsDataURL(file);
      setMessage("");
      setMessageType("");
    } else {
      setImageFile(null);
      setImagePreview(null);
      setFormData((prevData) => ({ ...prevData, image: currentImage }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setMessageType("");

    if (!user || !user.token) {
      setMessage("Authentication required. Please log in.");
      setMessageType("error");
      setIsSubmitting(false);
      navigate("/login");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setMessage("New password and confirm password do not match.");
      setMessageType("error");
      setIsSubmitting(false);
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      setMessageType("error");
      setIsSubmitting(false);
      return;
    }

    const updatedData = {
      username: formData.username,
      email: formData.email,
      name: formData.name,
      location: formData.location,
      image: formData.image,
    };

    if (newPassword) {
      updatedData.password = newPassword;
    }

    if (user.role === "doctor" && user.doctorProfile) {
      updatedData.specialization = user.doctorProfile.specialization;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      };

      console.log("Attempting to update profile with data:", updatedData);
      const response = await axios.patch(
        `${API_BASE_URL}/api/users/me`,
        updatedData,
        config
      );

      setMessage("Profile updated successfully!");
      setMessageType("success");

      const updatedUserFromBackend = response.data.updatedUser;
      if (updatedUserFromBackend) {
        const newCombinedUserInfo = {
          ...user,
          ...updatedUserFromBackend,
          token: user.token,
        };

        if (
          user.role === "doctor" &&
          updatedData.specialization !== undefined
        ) {
          newCombinedUserInfo.doctorProfile = {
            ...newCombinedUserInfo.doctorProfile,
            specialization: updatedData.specialization,
          };
        }

        localStorage.setItem("userInfo", JSON.stringify(newCombinedUserInfo));
        setUser(newCombinedUserInfo);
        setCurrentImage(
          newCombinedUserInfo.image ||
            "https://via.placeholder.com/150/14b8a6/ffffff?text=No+Image"
        );
      }

      setNewPassword("");
      setConfirmPassword("");
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      console.error("Error updating profile:", err);
      let errorMessage = "Failed to update profile. Please try again.";
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
        errorMessage = "Network error. Could not connect to server.";
      }
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xl text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isDoctor = user.role === "doctor";

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-6 flex justify-center items-center">
      <div className="max-w-2xl w-full bg-white shadow-2xl rounded-2xl p-8 space-y-6 border-2 border-teal-100">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent text-center mb-6">
          Profile Settings
        </h1>

        {message && (
          <div
            className={`px-5 py-4 rounded-xl border-l-4 ${
              messageType === "success"
                ? "bg-green-50 text-green-700 border-green-400"
                : "bg-red-50 text-red-700 border-red-400"
            }`}
            role="alert"
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-6">
              <img
                src={imagePreview || currentImage}
                alt="Profile"
                className="w-36 h-36 rounded-full object-cover border-4 border-teal-400 shadow-xl"
              />
              <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-700
                         file:mr-4 file:py-3 file:px-6
                         file:rounded-xl file:border-0
                         file:text-sm file:font-semibold
                         file:bg-teal-50 file:text-teal-700
                         hover:file:bg-teal-100 cursor-pointer transition-all"
            />
            <p className="text-sm text-gray-500 mt-3">
              Max file size 2MB (JPG, PNG, GIF)
            </p>
          </div>

          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              name="username"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-gray-700 transition-all"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-gray-700 transition-all"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-gray-700 transition-all"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Location
            </label>
            <input
              id="location"
              type="text"
              name="location"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-gray-700 transition-all"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          {/* Specialization - Only for doctors */}
          {isDoctor && (
            <div>
              <label
                htmlFor="specialization"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Specialization
              </label>
              <input
                id="specialization"
                type="text"
                name="specialization"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-gray-700 transition-all"
                value={user?.doctorProfile?.specialization || ""}
                onChange={(e) =>
                  setUser((prevUser) => ({
                    ...prevUser,
                    doctorProfile: {
                      ...prevUser.doctorProfile,
                      specialization: e.target.value,
                    },
                  }))
                }
              />
            </div>
          )}

          {/* New Password */}
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              New Password (Leave blank to keep current)
            </label>
            <input
              id="newPassword"
              type="password"
              name="newPassword"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-gray-700 transition-all"
              value={newPassword}
              onChange={handlePasswordChange}
              placeholder="••••••••"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-gray-700 transition-all"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              placeholder="••••••••"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-4 px-4 rounded-xl font-bold hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-4 focus:ring-teal-300 transition duration-300 ease-in-out transform hover:scale-[1.02] shadow-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}