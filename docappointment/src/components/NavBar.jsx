import React, { useState, useEffect } from "react";
import {
  FiChevronDown, // New: Import a static icon for aesthetic purposes
} from "react-icons/fi"; // Removed FiBell as it's no longer used
import { FaStethoscope } from "react-icons/fa"; // Import a static icon for aesthetic purposes
import { Link } from "react-router-dom";
import GetUserInfo from "../utils/GetUserInfo.jsx"; // Assuming you have this utility

export default function NavBar() {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // To explicitly track login state

  // Function to load/reload user info
  const loadUserInfo = async () => {
    const userInfo = await GetUserInfo(); // This utility reads from localStorage first, then API
    if (userInfo) {
      setUser(userInfo);
      setIsLoggedIn(true);
    } else {
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  // Fetch user info on component mount and set up storage listener
  useEffect(() => {
    loadUserInfo(); // Initial load

    // Listen for changes in localStorage (e.g., from Login, Register, ProfileSettings)
    const handleStorageChange = () => {
      console.log(
        "NavBar.jsx: localStorage change detected, reloading user info."
      );
      loadUserInfo(); // Reload user info when localStorage changes
    };

    window.addEventListener("storage", handleStorageChange);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []); // Empty dependency array means this useEffect runs once on mount

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white shadow-sm border-b border-gray-200">
      {/* Left: App Logo/Branding with Name */}
      <Link
        to="/dashboard"
        className="flex items-center gap-2 focus:outline-none cursor-pointer"
      >
        <span className="text-xl font-semibold text-gray-800 hover:text-blue-600">
          Home
        </span>
      </Link>

      {/* Center: This area is now empty, pushing other elements apart */}
      <div className="flex-1"></div>

      {/* Right: User Profile (Notifications bell replaced by aesthetic icon) */}
      <div className="flex items-center gap-6">
        {/* Aesthetic Placeholder Icon (non-functional) */}
        {isLoggedIn && ( // Only show if user is logged in, similar to a real notification bell
          <div
            className="cursor-default text-gray-400" // Use cursor-default and a muted color
            title="Medical tools" // Optional tooltip
          >
            <FaStethoscope className="w-6 h-6" /> {/* Aesthetic icon */}
          </div>
        )}

        {/* User Profile Dropdown / Login Link */}
        {isLoggedIn ? ( // Use isLoggedIn state here
          <Link
            to="/profileSettings"
            className="flex items-center gap-2 cursor-pointer text-gray-800 hover:text-blue-600 transition-colors duration-200"
          >
            <img
              // Use user.image directly from the fetched user object
              src={
                user?.image ||
                "https://via.placeholder.com/32/4a90e2/ffffff?text=U"
              }
              alt={user?.username || "User"}
              className="w-8 h-8 rounded-full object-cover border-2 border-blue-400"
            />
            {/* Username hidden on small screens for cleaner look */}
            <span className="font-medium hidden md:block">
              {user?.username || "User"}
            </span>
            <FiChevronDown className="w-4 h-4 text-purple-600" />
          </Link>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 cursor-pointer text-gray-800 hover:text-blue-600 transition-colors duration-200"
          >
            <span>Login</span>
          </Link>
        )}
      </div>
    </header>
  );
}
