const express = require("express");

const {
  reportProperty,
  getAllReports
} = require("../controllers/reportController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Tenant reports property
router.post(
  "/report",
  authMiddleware,
  reportProperty
);

// Get all reports
router.get(
  "/",
  authMiddleware,
  getAllReports
);

module.exports = router;