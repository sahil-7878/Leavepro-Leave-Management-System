
const express = require("express");
const router = express.Router();

const {
  getLeaves,
  getLeaveById,
  applyLeave,
  updateLeaveStatus,
  deleteLeave,
  getLeaveBalance
} = require("../controllers/leaveController");

const {
  protect,
  managerOnly
} = require("../middleware/authMiddleware");

// Get all leave requests
router.get("/", protect, getLeaves);

// Get employee leave balance
router.get("/balance", protect, getLeaveBalance);

// Get single leave request
router.get("/:id", protect, getLeaveById);

// Apply for leave
router.post("/", protect, applyLeave);

// Approve or reject leave (Manager only)
router.patch("/:id/status", protect, managerOnly, updateLeaveStatus);

// Delete leave request (Manager only)
router.delete("/:id", protect, managerOnly, deleteLeave);

module.exports = router;
