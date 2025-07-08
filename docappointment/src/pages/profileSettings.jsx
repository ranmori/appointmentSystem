import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import GetUserInfo from "../utils/GetUserInfo.jsx"; // Utility to get user info and token

export default function ProfileSettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // Stores the full user object from GetUserInfo
  const [loadingUser, setLoadingUser] = useState(true); // Initial load for user data

  // Form states for editable fields
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    name: "", // Added name field
    location: "", // Added location field
    image: "", // Added image field to formData for Base64 string
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentImage, setCurrentImage] = useState(
    "https://via.placeholder.com/150/cccccc/ffffff?text=No+Image"
  ); // Display current profile image
  // eslint-disable-next-line no-unused-vars
  const [imageFile, setImageFile] = useState(null); // For new image upload file
  const [imagePreview, setImagePreview] = useState(null); // For image preview URL

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"

  // Define API_BASE_URL using environment variable
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3022";
  // Fetch user data on component mount
  useEffect(() => {
    const loadUserInfo = async () => {
      const userInfo = await GetUserInfo();
      if (!userInfo || !userInfo.token) {
        navigate("/login"); // Redirect if not logged in
      } else {
        setUser(userInfo);
        setFormData({
          username: userInfo.username || "",
          email: userInfo.email || "",
          name: userInfo.name || "", // Initialize name from userInfo
          location: userInfo.location || "", // Initialize location from userInfo
          image: userInfo.image || "", // Initialize image Base64/URL from userInfo
        });
        // Prioritize image from userInfo, fallback to placeholder
        setCurrentImage(
          userInfo.image ||
            "https://via.placeholder.com/150/cccccc/ffffff?text=No+Image"
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
      // Limit file size to 2MB (2 * 1024 * 1024 bytes)
      if (file.size > 2 * 1024 * 1024) {
        setMessage("Image file size exceeds 2MB limit.");
        setMessageType("error");
        setImageFile(null);
        setImagePreview(null);
        setFormData((prevData) => ({ ...prevData, image: currentImage })); // Revert form image data
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Create a URL for preview

      // Read file as Data URL (Base64)
      const reader = new FileReader();
      reader.onloadend = () => {
        // When the reader finishes, set the Base64 string into formData.image
        setFormData((prevData) => ({ ...prevData, image: reader.result }));
      };
      reader.onerror = () => {
        console.error("Error reading file.");
        setMessage("Failed to read image file.");
        setMessageType("error");
        setImageFile(null);
        setImagePreview(null);
        setFormData((prevData) => ({ ...prevData, image: currentImage })); // Revert form image data
      };
      reader.readAsDataURL(file); // Convert file to Base64
      setMessage(""); // Clear previous messages
      setMessageType("");
    } else {
      setImageFile(null);
      setImagePreview(null);
      setFormData((prevData) => ({ ...prevData, image: currentImage })); // Revert to current image if file cleared
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

    // Client-side validation for password
    if (newPassword && newPassword !== confirmPassword) {
      setMessage("New password and confirm password do not match.");
      setMessageType("error");
      setIsSubmitting(false);
      return;
    }
    if (newPassword && newPassword.length < 6) {
      // Basic password length check
      setMessage("Password must be at least 6 characters long.");
      setMessageType("error");
      setIsSubmitting(false);
      return;
    }

    const updatedData = {
      username: formData.username,
      email: formData.email,
      name: formData.name, // Include name in update
      location: formData.location, // Include location in update
      image: formData.image, // Include Base64 image string or current URL
    };

    if (newPassword) {
      updatedData.password = newPassword; // Backend will hash this
    }

    // If user is a doctor, include specialization in the update
    if (user.role === "doctor" && user.doctorProfile) {
      updatedData.specialization = user.doctorProfile.specialization;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json", // Sending JSON data
        },
      };

      // Backend endpoint to update user profile: PATCH to /api/users/me
      console.log("Attempting to update profile with data:", updatedData);
      const response = await axios.patch(
        `${API_BASE_URL}/api/users/me`,
        updatedData,
        config
      );

      setMessage("Profile updated successfully!");
      setMessageType("success");

      // Update local storage and user state with new info from backend response
      const updatedUserFromBackend = response.data.updatedUser; // Assuming backend returns updated user under 'updatedUser' key
      if (updatedUserFromBackend) {
        // If the backend sends back a comprehensive user object, use it.
        // Otherwise, merge with current 'user' state to preserve doctorProfile if not sent back.
        const newCombinedUserInfo = {
          ...user,
          ...updatedUserFromBackend,
          token: user.token,
        };

        // Ensure doctorProfile specialization is preserved/updated correctly if it's a doctor
        if (
          user.role === "doctor" &&
          updatedData.specialization !== undefined
        ) {
          newCombinedUserInfo.doctorProfile = {
            ...newCombinedUserInfo.doctorProfile,
            specialization: updatedData.specialization, // Use specialization from updatedData
          };
        }

        localStorage.setItem("userInfo", JSON.stringify(newCombinedUserInfo));
        setUser(newCombinedUserInfo); // Update React state
        setCurrentImage(
          newCombinedUserInfo.image ||
            "https://via.placeholder.com/150/cccccc/ffffff?text=No+Image"
        ); // Update current image display
      }

      setNewPassword(""); // Clear password fields
      setConfirmPassword("");
      setImageFile(null); // Clear image file input
      setImagePreview(null); // Clear image preview
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
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Should be redirected by useEffect, but a fallback
  }

  const isDoctor = user.role === "doctor";

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-center">
      <div className="max-w-xl w-full bg-white shadow-xl rounded-lg p-8 space-y-6 border border-gray-200">
        <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
          Profile Settings
        </h1>

        {message && (
          <div
            className={`px-4 py-3 rounded-md ${
              messageType === "success"
                ? "bg-green-100 text-green-700 border border-green-400"
                : "bg-red-100 text-red-700 border border-red-400"
            }`}
            role="alert"
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={imagePreview || currentImage}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-400 shadow-md mb-4"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              // Using Tailwind classes for styling the file input directly
              className="block w-full text-sm text-gray-700
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-full file:border-0
                         file:text-sm file:font-semibold
                         file:bg-blue-50 file:text-blue-700
                         hover:file:bg-blue-100 cursor-pointer"
            />
            <p className="text-sm text-gray-500 mt-2">
              Max file size 2MB (JPG, PNG, GIF)
            </p>
          </div>

          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              name="username"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Name - Now included for all users */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          {/* Location - Now included for all users */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Location
            </label>
            <input
              id="location"
              type="text"
              name="location"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          {/* Specialization - Only for doctors */}
          {isDoctor && (
            <div>
              <label
                htmlFor="specialization"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Specialization
              </label>
              <input
                id="specialization"
                type="text"
                name="specialization"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                value={user?.doctorProfile?.specialization || ""} // Read from user.doctorProfile
                // Update specialization directly in the user state's doctorProfile
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
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              New Password (Leave blank to keep current)
            </label>
            <input
              id="newPassword"
              type="password"
              name="newPassword"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              value={newPassword}
              onChange={handlePasswordChange}
              placeholder="••••••••"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              placeholder="••••••••"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
