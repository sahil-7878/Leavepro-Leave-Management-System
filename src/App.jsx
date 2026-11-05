import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
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
const Protected = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === "manager" ? "/manager" : "/dashboard"} replace />;
  return children;
};
function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === "manager" ? "/manager" : "/dashboard"} /> : <Login />} />
      <Route element={<Protected><Layout /></Protected>}>
        <Route path="/dashboard" element={<EmployeeDashboard />} />
        <Route path="/apply-leave" element={<ApplyLeave />} />
        <Route path="/leave-history" element={<LeaveHistory />} />
        <Route path="/leave-balance" element={<LeaveBalance />} />
        <Route path="/leave-details/:id" element={<LeaveDetails />} />
        <Route path="/manager" element={<Protected role="manager"><ManagerDashboard /></Protected>} />
        <Route path="/leave-requests" element={<Protected role="manager"><LeaveRequests /></Protected>} />
        <Route path="/employees" element={<Protected role="manager"><Employees /></Protected>} />
        <Route path="/departments" element={<Protected role="manager"><Departments /></Protected>} />
      </Route>
      <Route path="*" element={<Navigate to={user ? (user.role === "manager" ? "/manager" : "/dashboard") : "/login"} />} />
    </Routes>
  );
}
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={2500} />
      </BrowserRouter>
    </AuthProvider>
  );
}
