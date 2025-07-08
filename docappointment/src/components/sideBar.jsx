import React, { useState, useEffect } from "react";
import {
  FaTachometerAlt,
  FaUserMd,
  FaCalendarAlt,
  FaComments,
  FaUser,
  FaInfoCircle,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserPlus,
  FaBell,
  FaBriefcaseMedical,
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import GetUserInfo from "../utils/GetUserInfo.jsx";

export default function SideBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [loadingAppointmentCount, setLoadingAppointmentCount] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3022";
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    const fetchUserInfoAndAppointments = async () => {
      if (!token) {
        setLoadingAppointmentCount(false);
        setAppointmentCount(0);
        setUser(null);
        return;
      }

      try {
        setLoadingAppointmentCount(true);
        const userInfo = await GetUserInfo();
        console.log(
          "SideBar.jsx (useEffect): User Info fetched by GetUserInfo:",
          userInfo
        );

        if (!userInfo || !userInfo.token) {
          console.log(
            "SideBar.jsx (useEffect): No user info or token found, clearing local storage."
          );
          localStorage.removeItem("token");
          localStorage.removeItem("username");
          localStorage.removeItem("userInfo");
          setIsLoggedIn(false);
          setAppointmentCount(0);
          setUser(null);
          setLoadingAppointmentCount(false);
          return;
        }
        setUser(userInfo);

        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        let count = 0;
        if (userInfo.role === "admin") {
          // For admin, fetch pending appointments from the summary endpoint
          const summaryResponse = await axios.get(
            `${API_BASE_URL}/api/admin/summary`,
            config
          );
          count = summaryResponse.data.pendingAppointments || 0;
        } else {
          // For patient/doctor, fetch their specific appointments
          const response = await axios.get(
            `${API_BASE_URL}/api/appointments`,
            config
          );
          if (Array.isArray(response.data)) {
            count = response.data.filter(
              (appt) => appt.status === "booked" || appt.status === "pending"
            ).length;
          } else if (
            response.data &&
            Array.isArray(response.data.appointments)
          ) {
            count = response.data.appointments.filter(
              (appt) => appt.status === "booked" || appt.status === "pending"
            ).length;
          }
        }
        setAppointmentCount(count);
      } catch (error) {
        console.error(
          "SideBar.jsx (useEffect): Error fetching data for sidebar:",
          error
        );
        setAppointmentCount(0);
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("username");
          localStorage.removeItem("userInfo");
          setIsLoggedIn(false);
          setUser(null);
        }
      } finally {
        setLoadingAppointmentCount(false);
      }
    };

    fetchUserInfoAndAppointments();

    const handleStorageChange = () => {
      const newToken = localStorage.getItem("token");
      setIsLoggedIn(!!newToken);
      if (newToken) {
        fetchUserInfoAndAppointments();
      } else {
        setAppointmentCount(0);
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [API_BASE_URL, isLoggedIn, navigate]);

  const isDoctor = user?.role === "doctor";
  console.log(
    "SideBar.jsx (render): isDoctor =",
    isDoctor,
    " (user.role:",
    user?.role,
    ")"
  );

  const allNavItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: FaTachometerAlt,
      requiresAuth: true,
      showFor: ["patient", "doctor"],
    },
    // Removed 'admin' from showFor for these two items:
    {
      name: "Appointments",
      path: "/appointments",
      icon: FaCalendarAlt,
      requiresAuth: true,
      showFor: ["patient", "doctor"],
      showBadge: true,
    },
    {
      name: "Book Appointment",
      path: "/book",
      icon: FaComments,
      requiresAuth: true,
      showFor: ["patient"],
    },

    // Removed 'admin' from showFor for this item:
    {
      name: "Doctors",
      path: "/doctors",
      icon: FaUserMd,
      requiresAuth: true,
      showFor: ["patient"],
    },
    {
      name: "Profile Settings",
      path: "/profileSettings",
      icon: FaUser,
      requiresAuth: true,
      showFor: ["patient", "doctor", "admin"],
    },
    {
      name: "Admin Panel",
      path: "/admin/dashboard",
      icon: FaTachometerAlt,
      requiresAuth: true,
      showFor: ["admin"],
    },
    {
      name: "About Doc Meet.",
      path: "/about",
      icon: FaInfoCircle,
      requiresAuth: false,
      showFor: ["patient", "doctor", "admin"],
    },
  ];

  const authNavItems = [
    { name: "Login", path: "/login", icon: FaSignInAlt },
    { name: "Register", path: "/register", icon: FaUserPlus },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userInfo");
    setIsLoggedIn(false);
    setAppointmentCount(0);
    setUser(null);
    navigate("/login");
  };

  const filteredNavItems = allNavItems.filter((item) => {
    if (!item.requiresAuth) {
      return true;
    }
    if (item.requiresAuth && isLoggedIn && user) {
      return item.showFor.includes(user.role);
    }
    if (
      !item.requiresAuth &&
      isLoggedIn &&
      user &&
      item.showFor.includes(user.role)
    ) {
      return true;
    }
    return false;
  });
  console.log(
    "SideBar.jsx (render): Filtered Nav Items:",
    filteredNavItems.map((item) => item.name)
  );

  return (
    <div className="w-64 min-h-screen bg-white text-gray-800 p-6 shadow-xl flex flex-col border-r border-gray-200">
      <Link
        to="/dashboard"
        className="flex items-center gap-2 cursor-pointer mb-20"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-700 rounded-full flex items-center justify-center text-white font-bold">
          <span className="text-xl">0</span>
        </div>
        <span className="text-xl font-semibold text-gray-800">Doc Meet.</span>
      </Link>

      <nav className="flex-grow">
        <h2 className="text-sm font-semibold text-gray-600 uppercase mb-4">
          Primary Menu
        </h2>
        <ul className="space-y-3">
          {filteredNavItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center p-3 rounded-lg text-lg font-medium transition-colors duration-200 
                  ${
                    location.pathname === item.path
                      ? "bg-blue-300 text-white shadow-md"
                      : "text-gray-700 hover:bg-blue-100 hover:text-blue-600"
                  }
                `}
              >
                <item.icon className="mr-3 text-xl" />
                {item.name}
                {item.showBadge &&
                  !loadingAppointmentCount &&
                  appointmentCount > 0 && (
                    <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                      {appointmentCount}
                    </span>
                  )}
                {item.showBadge && loadingAppointmentCount && (
                  <span className="ml-auto text-gray-400 text-xs px-2 py-0.5 rounded-full font-semibold">
                    ...
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-gray-200 my-6"></div>

      <h2 className="text-sm font-semibold text-gray-600 uppercase mb-4">
        Account
      </h2>
      <ul className="space-y-3">
        {!isLoggedIn ? (
          authNavItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center p-3 rounded-lg text-lg font-medium transition-colors duration-200 
                  ${
                    location.pathname === item.path
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                  }
                `}
              >
                <item.icon className="mr-3 text-xl" />
                {item.name}
              </Link>
            </li>
          ))
        ) : (
          <li>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-3 rounded-lg text-lg font-medium bg-red-600 hover:bg-red-700 text-white transition-colors duration-200 shadow-md"
            >
              <FaSignOutAlt className="mr-3 text-xl" />
              Logout
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}
