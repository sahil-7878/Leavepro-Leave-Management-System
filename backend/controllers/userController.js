
const User = require("../models/user");
const mongoose = require("mongoose");

// Get All Users (Manager)
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("department_id", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get User By ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const isManager = req.user.role === "manager";
    const isOwner = String(req.user._id) === id;

    if (!isManager && !isOwner) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const user = await User.findById(id)
      .select("-password")
      .populate("department_id", "name");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update User (Manager)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department_id, status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const updateData = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ success: false, message: "Name cannot be empty" });
      }
      updateData.name = name.trim();
    }

    if (email !== undefined) {
      if (!email.trim()) {
        return res.status(400).json({ success: false, message: "Email cannot be empty" });
      }

      updateData.email = email.trim().toLowerCase();
    }

    if (department_id !== undefined) {
      if (department_id && !mongoose.isValidObjectId(department_id)) {
        return res.status(400).json({ success: false, message: "Invalid department ID" });
      }
      updateData.department_id = department_id || null;
    }

    if (status !== undefined) {
      if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid user status" });
      }
      updateData.status = status;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .select("-password")
      .populate("department_id", "name");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user
    });
  } catch (error) {
    res.status(error.code === 11000 ? 409 : 500).json({
      success: false,
      message: error.code === 11000 ? "Email already exists" : error.message
    });
  }
};

// Delete User (Manager)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === "manager") {
      return res.status(403).json({
        success: false,
        message: "Manager account cannot be deleted"
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};
