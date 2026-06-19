const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../config/multer");

const {
  createProperty,
  getAllProperties,
  getPendingProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  approveProperty,
  rejectProperty,
  getDocument,
  getOwnerProperties,
  finalizeRental,
  togglePropertyVisibility,
  requestVerification,
  getAvailableProperties,
  searchProperties,
  getOwnerStats
} = require("../controllers/propertyController");

/* ---------------- CREATE PROPERTY ---------------- */
router.post(
  "/",authMiddleware,
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "taxReceipt", maxCount: 1 },
    { name: "aadhaarPan", maxCount: 1 },
    { name: "electricityBill", maxCount: 1 }
  ]),
  createProperty
);

/* ---------------- FILE ACCESS ---------------- */
router.get("/document/:filename", getDocument);

/* ---------------- READ ---------------- */
router.get("/", getAllProperties);
router.get("/pending", getPendingProperties);
router.get("/available", getAvailableProperties);
router.get("/search/filter", searchProperties);
router.get("/owner/:ownerId", authMiddleware,getOwnerProperties);
router.get("/owner-stats/:ownerId",authMiddleware, getOwnerStats);
router.get("/:id", getPropertyById);

/* ---------------- UPDATE ---------------- */
router.put("/:id", authMiddleware,updateProperty);

/* ---------------- DELETE ---------------- */
router.delete("/:id", authMiddleware, deleteProperty);

/* ---------------- ADMIN ---------------- */
router.put("/approve/:id", authMiddleware,approveProperty);
router.put("/reject/:id", authMiddleware,rejectProperty);

/* ---------------- RENTAL ---------------- */
router.put("/finalize-rental/:id", authMiddleware, finalizeRental);

/* ---------------- VISIBILITY ---------------- */
router.put("/toggle-visibility/:id", authMiddleware,togglePropertyVisibility);

/* ---------------- VERIFICATION ---------------- */
router.put("/request-verification/:id", authMiddleware, requestVerification);
module.exports = router;