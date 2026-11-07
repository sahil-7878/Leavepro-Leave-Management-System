const express = require("express");
const router = express.Router();

const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} = require("../controllers/userController");

const { protect, managerOnly } = require("../middleware/authMiddleware");

router.get("/", protect, managerOnly, getUsers);
router.get("/:id", protect, getUserById);
router.put("/:id", protect, managerOnly, updateUser);
router.delete("/:id", protect, managerOnly, deleteUser);

module.exports = router;