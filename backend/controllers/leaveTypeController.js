
const LeaveType = require("../models/LeaveType");

const getLeaveTypes = async (req, res) => {
  try {
    const leaveTypes = await LeaveType.find({ status: "active" });

    res.status(200).json({
      success: true,
      leaveTypes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createLeaveType = async (req, res) => {
  try {
    const { name, code, annual_limit } = req.body;

    if (!name || !code || annual_limit === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, code and annual limit are required"
      });
    }

    const leaveType = await LeaveType.create({
      name,
      code,
      annual_limit
    });

    res.status(201).json({
      success: true,
      message: "Leave type created successfully",
      leaveType
    });
  } catch (error) {
    res.status(error.code === 11000 ? 409 : 500).json({
      success: false,
      message: error.code === 11000 ? "Leave type code already exists" : error.message
    });
  }
};

const updateLeaveType = async (req, res) => {
  try {
    const leaveType = await LeaveType.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: "Leave type not found"
      });
    }

    res.status(200).json({ success: true, leaveType });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getLeaveTypes, createLeaveType, updateLeaveType };
