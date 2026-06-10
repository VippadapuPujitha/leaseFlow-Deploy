const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    phone: {
    type: String,
    match: [/^\d{10}$/, "Phone number must be 10 digits"]
  },

    role: {
      type: String,
      enum: ["owner", "tenant", "admin"],
      default: "tenant"
    },

    savedProperties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property"
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);