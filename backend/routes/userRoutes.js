const express = require("express");

const {
  getProfile,
  updateProfile,
  saveProperty,
  removeSavedProperty,
  getSavedProperties
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Profile APIs
router.get("/profile", authMiddleware, getProfile);

router.put("/profile", authMiddleware, updateProfile);

// Saved Properties APIs
router.post(
  "/save/:propertyId",
  authMiddleware,
  saveProperty
);

router.delete(
  "/save/:propertyId",
  authMiddleware,
  removeSavedProperty
);

router.get(
  "/saved-properties",
  authMiddleware,
  getSavedProperties
);

module.exports = router;