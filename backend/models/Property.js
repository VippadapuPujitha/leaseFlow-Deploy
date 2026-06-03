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
    taxReceipt: {
        type: String
    },
    aadhaarPan: {
        type: String
    },
    electricityBill: {
        type: String
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
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