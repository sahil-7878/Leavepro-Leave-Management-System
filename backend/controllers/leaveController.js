const LeaveRequest = require("../models/LeaveRequest");
const LeaveType = require("../models/LeaveType");
const mongoose = require("mongoose");

const DAY_MS = 86400000;

// Financial Year: April to March
const getFinancialYear = (date) => {
  const year = date.getFullYear();
  const startYear = date.getMonth() >= 3 ? year : year - 1;

  return {
    start: new Date(startYear, 3, 1),
    end: new Date(startYear + 1, 3, 1)
  };
};

// Calculate calendar days
const calculateDays = (start, end) => {
  const startDay = Date.UTC(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  );

  const endDay = Date.UTC(
    end.getFullYear(),
    end.getMonth(),
    end.getDate()
  );

  return Math.floor((endDay - startDay) / DAY_MS) + 1;
};

// Get Leave Requests
const getLeaves = async (req, res) => {
  try {
    const filter = req.user.role === "manager"
      ? {}
      : { employee_id: req.user._id };

    const leaves = await LeaveRequest.find(filter)
      .populate("employee_id", "name email")
      .populate("leave_type_id", "name code annual_limit")
      .populate("approved_by", "name")
      .sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      leaves
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Leave Request By ID
const getLeaveById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave ID"
      });
    }

    const leave = await LeaveRequest.findById(id)
      .populate("employee_id", "name email")
      .populate("leave_type_id", "name code")
      .populate("approved_by", "name");

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found"
      });
    }

    const employeeId = leave.employee_id?._id || leave.employee_id;

    if (
      req.user.role !== "manager" &&
      String(employeeId) !== String(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    res.status(200).json({
      success: true,
      leave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Apply for Leave
const applyLeave = async (req, res) => {
  try {
    const {
      leave_type_id,
      start_date,
      end_date,
      reason,
      half_day
    } = req.body;

    if (!leave_type_id || !start_date || !end_date || !reason?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required leave details"
      });
    }

    if (!mongoose.isValidObjectId(leave_type_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave type ID"
      });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end < start
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid leave dates"
      });
    }

    const isHalfDay = half_day === true;

    if (
      isHalfDay &&
      start.toDateString() !== end.toDateString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Half-day leave must be for a single date"
      });
    }

    const leaveType = await LeaveType.findOne({
      _id: leave_type_id,
      status: "active"
    });

    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: "Active leave type not found"
      });
    }

    // Financial Year Validation
    const { start: fyStart, end: fyEnd } = getFinancialYear(start);

    // Request must remain within one financial year
    if (start < fyStart || end >= fyEnd) {
      return res.status(400).json({
        success: false,
        message: "Leave dates must be within the same financial year"
      });
    }

    const totalDays = isHalfDay
      ? 0.5
      : calculateDays(start, end);

    // Check overlapping Pending or Approved leaves
    const overlap = await LeaveRequest.findOne({
      employee_id: req.user._id,
      status: { $in: ["Pending", "Approved"] },
      start_date: { $lte: end },
      end_date: { $gte: start }
    });

    if (overlap) {
      return res.status(409).json({
        success: false,
        message: "You already have a pending or approved leave during these dates"
      });
    }

    // Calculate used and pending leave days
    const existingLeaves = await LeaveRequest.find({
      employee_id: req.user._id,
      leave_type_id,
      status: { $in: ["Pending", "Approved"] },
      start_date: { $gte: fyStart, $lt: fyEnd }
    });

    const alreadyRequested = existingLeaves.reduce(
      (total, leave) => total + leave.total_days,
      0
    );

    const remaining = Math.max(
      0,
      leaveType.annual_limit - alreadyRequested
    );

    if (alreadyRequested + totalDays > leaveType.annual_limit) {
      return res.status(400).json({
        success: false,
        message: `Annual leave limit exceeded. Available balance: ${remaining} days`
      });
    }

    const leave = await LeaveRequest.create({
      employee_id: req.user._id,
      leave_type_id,
      start_date: start,
      end_date: end,
      total_days: totalDays,
      reason: reason.trim(),
      half_day: isHalfDay,
      status: "Pending",
      approved_by: null
    });

    res.status(201).json({
      success: true,
      message: "Leave applied successfully",
      leave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update Leave Status (Manager)
const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave ID"
      });
    }

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be Approved or Rejected"
      });
    }

    const leave = await LeaveRequest.findById(id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found"
      });
    }

    if (leave.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be updated"
      });
    }

    // Recheck annual limit before approval
    if (status === "Approved") {
      const leaveType = await LeaveType.findById(leave.leave_type_id);

      if (!leaveType || leaveType.status !== "active") {
        return res.status(400).json({
          success: false,
          message: "Leave type is unavailable"
        });
      }

      const { start: fyStart, end: fyEnd } =
        getFinancialYear(leave.start_date);

      const approvedLeaves = await LeaveRequest.find({
        _id: { $ne: leave._id },
        employee_id: leave.employee_id,
        leave_type_id: leave.leave_type_id,
        status: "Approved",
        start_date: { $gte: fyStart, $lt: fyEnd }
      });

      const usedDays = approvedLeaves.reduce(
        (total, item) => total + item.total_days,
        0
      );

      if (usedDays + leave.total_days > leaveType.annual_limit) {
        return res.status(400).json({
          success: false,
          message: "Cannot approve: annual leave limit exceeded"
        });
      }
    }

    leave.status = status;
    leave.approved_by = req.user._id;
    leave.updated_at = new Date();

    await leave.save();

    res.status(200).json({
      success: true,
      message: `Leave ${status.toLowerCase()} successfully`,
      leave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete Leave Request (Manager)
const deleteLeave = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave ID"
      });
    }

    const leave = await LeaveRequest.findByIdAndDelete(id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Leave request deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Employee Leave Balance
const getLeaveBalance = async (req, res) => {
  try {
    const { start: fyStart, end: fyEnd } =
      getFinancialYear(new Date());

    const leaveTypes = await LeaveType.find({
      status: "active"
    });

    const approvedLeaves = await LeaveRequest.find({
      employee_id: req.user._id,
      status: "Approved",
      start_date: { $lt: fyEnd },
      end_date: { $gte: fyStart }
    });

    const balances = leaveTypes.map((type) => {
      const used = approvedLeaves.reduce((total, leave) => {
        if (String(leave.leave_type_id) !== String(type._id)) {
          return total;
        }

        // Half-day leave
        if (leave.half_day) {
          return total + 0.5;
        }

        // Count only days inside current financial year
        const start = new Date(Math.max(
          leave.start_date.getTime(),
          fyStart.getTime()
        ));

        const end = new Date(Math.min(
          leave.end_date.getTime(),
          fyEnd.getTime() - 1
        ));

        return total + calculateDays(start, end);
      }, 0);

      return {
        leave_type_id: type._id,
        name: type.name,
        code: type.code,
        annual_limit: type.annual_limit,
        used,
        remaining: Math.max(0, type.annual_limit - used)
      };
    });

    const year = fyStart.getFullYear();

    res.status(200).json({
      success: true,
      financial_year: `${year}-${year + 1}`,
      balances
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getLeaves,
  getLeaveById,
  applyLeave,
  updateLeaveStatus,
  deleteLeave,
  getLeaveBalance
};