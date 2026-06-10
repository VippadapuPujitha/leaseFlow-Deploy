const express = require("express");
const router = express.Router();

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
  "/",
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
router.get("/owner/:ownerId", getOwnerProperties);
router.get("/owner-stats/:ownerId", getOwnerStats);
router.get("/:id", getPropertyById);

/* ---------------- UPDATE ---------------- */
router.put("/:id", updateProperty);

/* ---------------- DELETE ---------------- */
router.delete("/:id", deleteProperty);

/* ---------------- ADMIN ---------------- */
router.put("/approve/:id", approveProperty);
router.put("/reject/:id", rejectProperty);

/* ---------------- RENTAL ---------------- */
router.put("/finalize-rental/:id", finalizeRental);

/* ---------------- VISIBILITY ---------------- */
router.put("/toggle-visibility/:id", togglePropertyVisibility);

/* ---------------- VERIFICATION ---------------- */
router.put("/request-verification/:id", requestVerification);
module.exports = router;