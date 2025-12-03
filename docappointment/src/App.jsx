import React from "react";
import { createBrowserRouter, Outlet, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx"; // <<< Import your new Layout component

// Import all your page components
import Book from "./pages/Book.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import DoctorList from "./pages/DoctorList.jsx";
import Login from "./pages/Login.jsx";
import AboutPage from "./pages/AboutPage";
import BookingPage from "./pages/BookingPage.jsx";
import Register from "./pages/Register.jsx";
import Landing from "./pages/Landing.jsx";
import Appointments from "./pages/Appointments.jsx";
import UserManagement from "./pages/UserManagement.jsx";
import DoctorManagement from "./pages/DoctorManagement.jsx";
import AppointmentManagement from "./pages/AppointmentManagement.jsx"; // <<< IMPORT APPOINTMENT MANAGEMENT
import NotFound from "./pages/NotFound.jsx";
import ProfileSettings from "./pages/profileSettings.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx"; // <<< IMPORT ADMIN DASHBOARD

// --- Authentication Placeholder ---
const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  console.log("isAuthenticated check: Token found in localStorage?", !!token);
  console.log("isAuthenticated check: Raw token value:", token);
  return !!token;
};

// --- ProtectedRoutes Component ---
// This component acts as a guard for routes that require authentication.
const ProtectedRoutes = () => {
  console.log("ProtectedRoutes rendering...");
  const authStatus = isAuthenticated();
  console.log("ProtectedRoutes: Authentication Status:", authStatus);
  return authStatus ? <Outlet /> : <Navigate to="/login" replace />;
};

// --- Main Router Configuration ---
const App = createBrowserRouter([
  {
    path: "/",
    element: <Landing />, // Your landing page (public, no layout)
    errorElement: <NotFound />,
  },
  {
    path: "/login",
    element: <Login />, // Login page (public, no layout)
  },
  {
    path: "/register",
    element: <Register />, // Register page (public, no layout)
  },
  {
    // This route acts as a parent for all routes that need authentication
    element: <ProtectedRoutes />,
    children: [
      {
        // This is the LAYOUT route. All routes nested here will render inside the Layout.
        // It has no 'path' property itself, meaning it will render for all child paths.
        element: <Layout />, // <<< Apply the Layout component here
        children: [
          {
            path: "/dashboard",
            element: <Dashboard />, // Will render inside Layout's <Outlet />
          },
          {
            path: "/doctors",
            element: <DoctorList />, // Will render inside Layout's <Outlet />
          },
          {
            path: "/book",
            element: <Book />, // Will render inside Layout's <Outlet />
          },
          {
            path: "/BookingPage",
            element: <BookingPage />, // Will render inside Layout's <Outlet />
          },
          {
            path: "/Appointments",
            element: <Appointments />, // Will render inside Layout's <Outlet />
          },
          {
            path: "/About",
            element: <AboutPage />, // Will render inside Layout's <Outlet />
          },
          {
            path: "/ProfileSettings",
            element: <ProfileSettings />,
          },
          {
            path: "/admin/dashboard", // <<< NEW ADMIN DASHBOARD ROUTE
            element: <AdminDashboard />, // Will render inside Layout's <Outlet />
          },
          {
            path: "/admin/users", // This path matches the 'to' prop from the Link
            element: <UserManagement />, // 
          },
          {
            path: "/admin/doctors", // <<< NEW ADMIN DOCTOR MANAGEMENT ROUTE
            element: <DoctorManagement />,
          },
          {
            path: "/admin/appointments", // <<< NEW ADMIN APPOINTMENT MANAGEMENT ROUTE
            element: <AppointmentManagement />,
          },
          // Add placeholders for other authenticated routes that use the layout
        ],
      },
      // You can add other protected routes here that *don't* use the layout,
      // but typically most authenticated routes use the main layout.
    ],
  },
  {
    // Global fallback for any routes not matched by the above
    path: "*",
    element: <NotFound />,
  },
]);

export default App;
