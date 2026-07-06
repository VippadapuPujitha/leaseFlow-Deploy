const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    rent: {
      type: Number,
      required: true,
    },
    propertyType: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    bedrooms: {
      type: Number,
      default: 0,
    },
    bathrooms: {
      type: Number,
      default: 0,
    },
    squareFeet: {
      type: Number,
      default: 0,
    },
    availableFrom: {
      type: Date,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    images: {
      type: [String],
      default: [],
    },
    taxReceipt: {
      type: String,
      default: "",
    },
    aadhaarPan: {
      type: String,
      default: "",
    },
    electricityBill: {
      type: String,
      default: "",
    },
    taxDocument: {
      type: String,
      default: "",
    },
    ownershipDocument: {
      type: String,
      default: "",
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    verificationStatus: {
      type: String,
      enum: ["not_requested", "pending", "verified", "rejected"],
      default: "not_requested",
    },
    rentalStatus: {
      type: String,
      enum: ["available", "occupied"],
      default: "available",
    },
    status: {
      type: String,
      default: "PENDING",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Property", propertySchema);
