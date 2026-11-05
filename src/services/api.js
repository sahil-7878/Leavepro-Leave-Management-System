import axios from "axios";

// Check karein ki hum local par hain ya live
const isLocal = import.meta.env.DEV;

// Local par proxy ya direct URL, Live par db.json
const API = axios.create({
  baseURL: isLocal ? "http://localhost:5000" : "/",
});

export const loginUser = async (email, password) => {
  try {
    const url = isLocal ? "/users" : "db.json";
    const response = await API.get(url);

    // Local aur Live dono ke liye data handle karein
    const users = isLocal ? response.data : response.data.users;

    const user = users.find(
      (u) =>
        u.email?.trim().toLowerCase() === email.trim().toLowerCase() &&
        String(u.password) === String(password)
    );

    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (user.status !== "active") {
      throw new Error("Your account is inactive");
    }

    return user;
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

// Helper function for fetching data
const fetchData = async (endpoint) => {
  const url = isLocal ? `/${endpoint}` : "db.json";
  const response = await API.get(url);
  return isLocal ? response.data : response.data[endpoint];
};

// ✅ CORRECT ENDPOINTS (underscore ke saath)
export const getUsers = () => fetchData("users");
export const getDepartments = () => fetchData("departments");
export const getLeaveTypes = () => fetchData("leave_types");
export const getLeaveRequests = () => fetchData("leave_requests");

export const getLeaveRequestById = async (id) => {
  const requests = await fetchData("leave_requests");
  return requests.find((r) => String(r.id) === String(id));
};

// Write operations (sirf local par chalenge)
export const createLeaveRequest = (payload) =>
  API.post("/leave_requests", payload).then((r) => r.data);

export const updateLeaveStatus = (id, status, managerId) =>
  API.patch(`/leave_requests/${id}`, {
    status,
    approved_by: managerId,
    updated_at: new Date().toISOString().split("T")[0],
  }).then((r) => r.data);

export default API;