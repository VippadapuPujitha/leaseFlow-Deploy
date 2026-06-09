const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  sendRentalRequest
} = require("../controllers/requestController");

// Tenant sends rental request
router.post(
  "/send",
  authMiddleware,
  sendRentalRequest
);

module.exports = router;