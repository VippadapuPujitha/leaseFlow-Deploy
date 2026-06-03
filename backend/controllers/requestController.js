const Request = require("../models/Request");
const Property = require("../models/Property");

// Send Rental Request
exports.sendRentalRequest = async (req, res) => {
  try {

    const { propertyId } = req.body;

    // Check property exists
    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    // Check property is ACTIVE
    if (property.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "Property is not available"
      });
    }

    // Create request
    const request = await Request.create({
      tenant: req.user.id,
      property: propertyId
    });

    res.status(201).json({
      success: true,
      message: "Rental request sent successfully",
      request
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};