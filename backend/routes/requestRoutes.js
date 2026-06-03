const express = require("express");

const {
  sendRequest,
} = require("../controllers/requestController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Tenant sends rental request
router.post(
  "/send",
  authMiddleware,
  sendRequest
);

module.exports = router;