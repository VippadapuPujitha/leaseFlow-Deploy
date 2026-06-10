const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  sendRentalRequest,
  withdrawRequest,
  viewMyRequests,
  viewPropertyRequests,
  acceptRequest,
  rejectRequest
} = require("../controllers/requestController");

// Tenant sends rental request
router.post(
  "/send",
  authMiddleware,
  sendRentalRequest
);
router.patch(
  "/withdraw/:id",
  authMiddleware,
  withdrawRequest
);
router.get(
  "/my-requests",
  authMiddleware,
  viewMyRequests
);
router.get(
  "/property/:propertyId",
  authMiddleware,
  viewPropertyRequests
);
router.patch(
  "/accept/:id",
  authMiddleware,
  acceptRequest
);
router.patch(
  "/reject/:id",
  authMiddleware,
  rejectRequest
);
module.exports = router;
