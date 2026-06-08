const User = require("../models/User");
const Property = require("../models/Property");

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json(user);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const updates = {};

    if (req.body.name !== undefined) {
      updates.name = req.body.name;
    }

    if (req.body.phone !== undefined) {
      updates.phone = req.body.phone;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      {
        new: true,
        runValidators: true
      }
    ).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      user
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Save Property
exports.saveProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        message: "Property not found"
      });
    }

    const user = await User.findById(req.user.id);

    const alreadySaved = user.savedProperties.some(
      (id) => id.toString() === propertyId
    );

    if (alreadySaved) {
      return res.status(400).json({
        message: "Property already saved"
      });
    }

    user.savedProperties.push(propertyId);

    await user.save();

    res.status(200).json({
      message: "Property saved successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Remove Saved Property
exports.removeSavedProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const user = await User.findById(req.user.id);

    user.savedProperties = user.savedProperties.filter(
      (id) => id.toString() !== propertyId
    );

    await user.save();

    res.status(200).json({
      message: "Property removed successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get Saved Properties
exports.getSavedProperties = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("savedProperties");

    res.status(200).json(user.savedProperties);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};