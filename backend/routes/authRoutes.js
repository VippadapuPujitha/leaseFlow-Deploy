const express = require("express");

const {
  register,
  login,
  getProfile,
  sendOtp,
  verifyOtp,
  resendOtp,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Public Routes
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
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