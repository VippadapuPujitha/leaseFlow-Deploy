const express = require("express");

const {
  register,
  login,
  getProfile,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Public Routes
router.post("/register", register);
router.post("/login", login);

// Protected Route
router.get("/profile", authMiddleware, getProfile);

// Owner Only Route (Testing roleMiddleware)
router.get(
  "/owner-only",
  authMiddleware,
  roleMiddleware("owner"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome Owner",
    });
  }
);

module.exports = router;