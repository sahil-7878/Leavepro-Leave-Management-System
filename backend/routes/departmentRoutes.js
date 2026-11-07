const express = require("express");
const router = express.Router();
const { protect, managerOnly } = require("../middleware/authMiddleware");
const { getDepartments, createDepartment, updateDepartment } = require("../controllers/departmentController");

router.get("/", protect, getDepartments);
router.post("/", protect, managerOnly, createDepartment);
router.put("/:id", protect, managerOnly, updateDepartment);

module.exports = router;