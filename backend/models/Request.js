const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected","withdrawn"],
      default: "pending",
    },
    owner: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
},
    contactShared: {
      type: Boolean,
      default: false,
  },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Request", requestSchema);