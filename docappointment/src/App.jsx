import React, { lazy, Suspense } from "react";
import { createBrowserRouter, Outlet, Navigate } from "react-router-dom";

// --- Lazy-loaded components ---
// Public pages
const Landing = lazy(() => import("./pages/Landing.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

// Protected layout
const Layout = lazy(() => import("./components/Layout.jsx"));

// User pages
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const DoctorList = lazy(() => import("./pages/DoctorList.jsx"));
const Book = lazy(() => import("./pages/Book.jsx"));
const BookingPage = lazy(() => import("./pages/BookingPage.jsx"));
const Appointments = lazy(() => import("./pages/Appointments.jsx"));
const AboutPage = lazy(() => import("./pages/AboutPage.jsx"));
const ProfileSettings = lazy(() => import("./pages/profileSettings.jsx"));

// Admin pages
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx"));
const UserManagement = lazy(() => import("./pages/UserManagement.jsx"));
const DoctorManagement = lazy(() => import("./pages/DoctorManagement.jsx"));
const AppointmentManagement = lazy(() =>
  import("./pages/AppointmentManagement.jsx")
);

// --- Authentication Check ---
const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

// --- ProtectedRoutes Component ---
const ProtectedRoutes = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
};

// --- WRAP ROUTES WITH SUSPENSE ---
class LazyLoadErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <p>Failed to load. Please refresh the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const withSuspense = (element) => (
  <LazyLoadErrorBoundary>
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      {element}
    </Suspense>
  </LazyLoadErrorBoundary>
);

// --- Main Router Configuration ---
const App = createBrowserRouter([
  {
    path: "/",
    element: withSuspense(<Landing />),
    errorElement: withSuspense(<NotFound />),
  },
  {
    path: "/login",
    element: withSuspense(<Login />),
  },
  {
    path: "/register",
    element: withSuspense(<Register />),
  },

  // --- Protected Routes ---
  {
    element: <ProtectedRoutes />,
    children: [
      {
        element: withSuspense(<Layout />),
        children: [
          { path: "/dashboard", element: withSuspense(<Dashboard />) },
          { path: "/doctors", element: withSuspense(<DoctorList />) },
          { path: "/book", element: withSuspense(<Book />) },
          { path: "/BookingPage", element: withSuspense(<BookingPage />) },
          { path: "/Appointments", element: withSuspense(<Appointments />) },
          { path: "/About", element: withSuspense(<AboutPage />) },
          {
            path: "/ProfileSettings",
            element: withSuspense(<ProfileSettings />),
          },

          // Admin
          {
            path: "/admin/dashboard",
            element: withSuspense(<AdminDashboard />),
          },
          { path: "/admin/users", element: withSuspense(<UserManagement />) },
          {
            path: "/admin/doctors",
            element: withSuspense(<DoctorManagement />),
          },
          {
            path: "/admin/appointments",
            element: withSuspense(<AppointmentManagement />),
          },
        ],
      },
    ],
  },

  {
    path: "*",
    element: withSuspense(<NotFound />),
  },
]);

export default App;
