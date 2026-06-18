const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  getAllProperties,
  getVerificationQueue,
  getPropertyById,
  verifyProperty,
  rejectProperty,
  deleteProperty,
} = require("../controllers/adminController");

const router = express.Router();

router.use(authMiddleware, roleMiddleware("admin"));

router.get("/properties", getAllProperties);
router.get("/verification-queue", getVerificationQueue);
router.get("/property/:id", getPropertyById);
router.put("/verify/:id", verifyProperty);
router.put("/reject/:id", rejectProperty);
router.delete("/property/:id", deleteProperty);

module.exports = router;
