const express = require("express");
const router = express.Router();
const { protect, managerOnly } = require("../middleware/authMiddleware");
const { getLeaveTypes, createLeaveType, updateLeaveType } = require("../controllers/leaveTypeController");

router.get("/", protect, getLeaveTypes);
router.post("/", protect, managerOnly, createLeaveType);
router.put("/:id", protect, managerOnly, 
    updateLeaveType);

module.exports = router;