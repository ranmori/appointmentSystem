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
          const summaryResponse = await axios.get(
            `${API_BASE_URL}/api/admin/summary`,
            config
          );
          count = summaryResponse.data.pendingAppointments || 0;
        } else {
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

  const allNavItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: FaTachometerAlt,
      requiresAuth: true,
      showFor: ["patient", "doctor"],
    },
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

  return (
    <div className="w-64 min-h-screen bg-gradient-to-b from-white to-teal-50 text-gray-800 p-6 shadow-xl flex flex-col border-r-2 border-teal-100">
      <Link
        to="/dashboard"
        className="flex items-center gap-3 cursor-pointer mb-12 group"
      >
        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl transition-all">
          <span className="text-2xl">D</span>
        </div>
        <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
          Doc Meet.
        </span>
      </Link>

      <nav className="flex-grow">
        <h2 className="text-xs font-semibold text-gray-500 uppercase mb-4 tracking-wider">
          Primary Menu
        </h2>
        <ul className="space-y-2">
          {filteredNavItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center p-3.5 rounded-xl text-base font-medium transition-all duration-200 
                  ${
                    location.pathname === item.path
                      ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg scale-105"
                      : "text-gray-700 hover:bg-teal-50 hover:text-teal-700 hover:scale-102"
                  }
                `}
              >
                <item.icon className="mr-3 text-lg" />
                {item.name}
                {item.showBadge &&
                  !loadingAppointmentCount &&
                  appointmentCount > 0 && (
                    <span className="ml-auto bg-cyan-500 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-md">
                      {appointmentCount}
                    </span>
                  )}
                {item.showBadge && loadingAppointmentCount && (
                  <span className="ml-auto text-gray-400 text-xs px-2 py-0.5 rounded-full">
                    ...
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t-2 border-teal-100 my-6"></div>

      <h2 className="text-xs font-semibold text-gray-500 uppercase mb-4 tracking-wider">
        Account
      </h2>
      <ul className="space-y-2">
        {!isLoggedIn ? (
          authNavItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center p-3.5 rounded-xl text-base font-medium transition-all duration-200 
                  ${
                    location.pathname === item.path
                      ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-teal-50 hover:text-teal-700"
                  }
                `}
              >
                <item.icon className="mr-3 text-lg" />
                {item.name}
              </Link>
            </li>
          ))
        ) : (
          <li>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-3.5 rounded-xl text-base font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FaSignOutAlt className="mr-3 text-lg" />
              Logout
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}