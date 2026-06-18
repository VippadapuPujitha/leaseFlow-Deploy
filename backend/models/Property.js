const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
{
    title: {
        type: String,
        required: true
    },

    address: {
        type: String,
        required: true
    },

    rent: {
        type: Number,
        required: true
    },

    propertyType: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    images: [
        {
            type: String
        }
    ],

    // Existing Documents
    taxReceipt: {
        type: String
    },

    aadhaarPan: {
        type: String
    },

    electricityBill: {
        type: String
    },

    // New Location Fields
    latitude: {
        type: Number
    },

    longitude: {
        type: Number
    },

    // New Verification Documents
    taxDocument: {
        type: String
    },

    ownershipDocument: {
        type: String
    },

    // Verification Tracking
    verificationStatus: {
        type: String,
        enum: ["pending", "approved", "verified", "rejected"],
        default: "pending"
    },

    rejectionReason: {
        type: String,
        default: ""
    },

    // Rental Status
    rentalStatus: {
        type: String,
        enum: ["available", "rented"],
        default: "available"
    },

    // Hide Property Without Deleting
    isHidden: {
        type: Boolean,
        default: false
    },

    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Existing Status Field
    status: {
        type: String,
        enum: ["PENDING", "ACTIVE", "REJECTED", "LOCKED"],
        default: "PENDING"
    }
},
{
    timestamps: true
}
);

module.exports = mongoose.model("Property", propertySchema);