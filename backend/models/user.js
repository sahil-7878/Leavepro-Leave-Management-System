const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ["manager", "employee"], required: true },
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  status: { type: String, default: "active" },
  created_at: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);