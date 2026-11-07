
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes
} from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider, useAuth } from "./context/AuthContext";

import Layout from "./components/Layout";
import Login from "./pages/Login";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import ApplyLeave from "./pages/ApplyLeave";
import LeaveHistory from "./pages/LeaveHistory";
import LeaveBalance from "./pages/LeaveBalance";
import LeaveDetails from "./pages/LeaveDetails";
import LeaveRequests from "./pages/LeaveRequests";
import Employees from "./pages/Employees";
import Departments from "./pages/Departments";

// Protected Routes
const Protected = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return (
      <Navigate
        to={user.role === "manager" ? "/manager" : "/dashboard"}
        replace
      />
    );
  }

  return children;
};

// Application Routes
function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const homePath = user
    ? user.role === "manager"
      ? "/manager"
      : "/dashboard"
    : "/login";

  return (
    <Routes>
      {/* Public Route */}
      <Route
        path="/login"
        element={
          user
            ? <Navigate to={homePath} replace />
            : <Login />
        }
      />

      {/* Protected Layout */}
      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        {/* Employee Routes */}
        <Route
          path="/dashboard"
          element={
            <Protected role="employee">
              <EmployeeDashboard />
            </Protected>
          }
        />

        <Route
          path="/apply-leave"
          element={
            <Protected role="employee">
              <ApplyLeave />
            </Protected>
          }
        />

        <Route
          path="/leave-history"
          element={
            <Protected role="employee">
              <LeaveHistory />
            </Protected>
          }
        />

        <Route
          path="/leave-balance"
          element={
            <Protected role="employee">
              <LeaveBalance />
            </Protected>
          }
        />

        <Route
          path="/leave-details/:id"
          element={<LeaveDetails />}
        />

        {/* Manager Routes */}
        <Route
          path="/manager"
          element={
            <Protected role="manager">
              <ManagerDashboard />
            </Protected>
          }
        />

        <Route
          path="/leave-requests"
          element={
            <Protected role="manager">
              <LeaveRequests />
            </Protected>
          }
        />

        <Route
          path="/employees"
          element={
            <Protected role="manager">
              <Employees />
            </Protected>
          }
        />

        <Route
          path="/departments"
          element={
            <Protected role="manager">
              <Departments />
            </Protected>
          }
        />
      </Route>

      {/* Default Route */}
      <Route
        path="/"
        element={<Navigate to={homePath} replace />}
      />

      {/* Not Found */}
      <Route
        path="*"
        element={<Navigate to={homePath} replace />}
      />
    </Routes>
  );
}

// Main App
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />

        <ToastContainer
          position="top-right"
          autoClose={2500}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
