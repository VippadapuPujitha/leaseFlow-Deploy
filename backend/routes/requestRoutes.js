const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  sendRentalRequest,
  withdrawRequest,
  viewMyRequests,
  viewPropertyRequests,
  acceptRequest,
  rejectRequest,
  getOwnerRequests,
  finalizeDeal
} = require("../controllers/requestController");

/* ================= TENANT ================= */
router.post("/send", authMiddleware, sendRentalRequest);

router.patch("/withdraw/:id", authMiddleware, withdrawRequest);

router.get("/my-requests", authMiddleware, viewMyRequests);

/* ================= OWNER ================= */
router.get("/property/:propertyId", authMiddleware, viewPropertyRequests);

/* ================= OWNER ACTIONS ================= */
router.patch("/accept/:id", authMiddleware, acceptRequest);

router.patch("/reject/:id", authMiddleware, rejectRequest);

router.get("/owner", authMiddleware, getOwnerRequests);

router.patch("/finalize/:id", authMiddleware, finalizeDeal);
module.exports = router;