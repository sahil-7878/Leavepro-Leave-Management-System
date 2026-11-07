
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "https://leavepro-leave-management-system.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every protected request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("leavepro_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle authentication errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("leavepro_token");
      localStorage.removeItem("leavepro_user");
    }

    return Promise.reject(error);
  }
);

// Normalize MongoDB documents for existing frontend compatibility
const normalizeUser = (user) => {
  if (!user) return user;

  return {
    ...user,
    id: user.id || user._id,
    department_id:
      user.department_id?._id ||
      user.department_id ||
      null,
  };
};

const normalizeLeave = (leave) => {
  if (!leave) return leave;

  return {
    ...leave,
    id: leave.id || leave._id,
    employee_id:
      leave.employee_id?._id ||
      leave.employee_id,
    leave_type_id:
      leave.leave_type_id?._id ||
      leave.leave_type_id,
    approved_by:
      leave.approved_by?._id ||
      leave.approved_by ||
      null,
  };
};

// AUTHENTICATION

export const loginUser = async (email, password) => {
  try {
    const response = await API.post("/auth/login", {
      email: email.trim().toLowerCase(),
      password,
    });

    const { token, user } = response.data;

    localStorage.setItem("leavepro_token", token);
    localStorage.setItem(
      "leavepro_user",
      JSON.stringify(normalizeUser(user))
    );

    return {
      ...normalizeUser(user),
      token,
    };
  } catch (error) {
    console.error("Login Error:", error);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Login failed"
    );
  }
};

export const registerUser = async (payload) => {
  try {
    const response = await API.post("/auth/register", payload);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Registration failed"
    );
  }
};

export const getProfile = async () => {
  const response = await API.get("/auth/profile");
  return normalizeUser(response.data.user || response.data);
};

export const logoutUser = () => {
  localStorage.removeItem("leavepro_token");
  localStorage.removeItem("leavepro_user");
};

// USERS

export const getUsers = async () => {
  const response = await API.get("/users");

  return (response.data.users || []).map(normalizeUser);
};

export const getUserById = async (id) => {
  const response = await API.get(`/users/${id}`);
  return normalizeUser(response.data.user || response.data);
};

export const updateUser = async (id, payload) => {
  const response = await API.put(`/users/${id}`, payload);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await API.delete(`/users/${id}`);
  return response.data;
};

// DEPARTMENTS

export const getDepartments = async () => {
  const response = await API.get("/departments");

  return response.data.departments || [];
};

export const createDepartment = async (payload) => {
  const response = await API.post("/departments", payload);
  return response.data;
};

export const updateDepartment = async (id, payload) => {
  const response = await API.put(`/departments/${id}`, payload);
  return response.data;
};

// LEAVE TYPES

export const getLeaveTypes = async () => {
  const response = await API.get("/leave-types");

  return response.data.leaveTypes || response.data.leave_types || [];
};

export const createLeaveType = async (payload) => {
  const response = await API.post("/leave-types", payload);
  return response.data;
};

export const updateLeaveType = async (id, payload) => {
  const response = await API.put(`/leave-types/${id}`, payload);
  return response.data;
};

// LEAVE REQUESTS

export const getLeaveRequests = async () => {
  const response = await API.get("/leaves");

  return (response.data.leaves || []).map(normalizeLeave);
};

export const getLeaveRequestById = async (id) => {
  const response = await API.get(`/leaves/${id}`);
  return normalizeLeave(response.data.leave);
};

export const createLeaveRequest = async (payload) => {
  const response = await API.post("/leaves", payload);
  return normalizeLeave(response.data.leave);
};

export const updateLeaveStatus = async (id, status) => {
  const response = await API.patch(`/leaves/${id}/status`, {
    status,
  });

  return normalizeLeave(response.data.leave);
};

export const deleteLeaveRequest = async (id) => {
  const response = await API.delete(`/leaves/${id}`);
  return response.data;
};

// EMPLOYEE LEAVE BALANCE

export const getLeaveBalance = async () => {
  const response = await API.get("/leaves/balance");
  return response.data;
};

export default API;
