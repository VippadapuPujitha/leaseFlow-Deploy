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
    
    city: {
    type: String,
    default: ""
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
    bedrooms: {
    type: Number,
    default: 1
},
    bathrooms: {
    type: Number,
    default: 1
},
squareFeet: {
    type: Number,
    default: 0
},
availableFrom: {
    type: Date
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
bedrooms: {
  type: Number,
  required: true
},

bathrooms: {
  type: Number,
  required: true
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
        enum: ["not_requested", "pending", "verified", "rejected"],
        default: "not_requested"
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
city: {
  type: String,
  required: true
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