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
// Withdraw Rental Request
exports.withdrawRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    // Only pending requests can be withdrawn
    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be withdrawn"
      });
    }

    request.status = "withdrawn";
    await request.save();

    res.status(200).json({
      success: true,
      message: "Request withdrawn successfully",
      request
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// View My Requests
exports.viewMyRequests = async (req, res) => {
  try {

    const requests = await Request.find({
      tenant: req.user.id
    })
    .populate("property");

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};
// View Requests For A Property
exports.viewPropertyRequests = async (req, res) => {
  try {

    const requests = await Request.find({
      property: req.params.propertyId
    })
    .populate("tenant", "name email")
    .populate("property");

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};
// Accept Request
exports.acceptRequest = async (req, res) => {
  try {

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    request.status = "accepted";
    request.contactShared = true;

    await request.save();

    res.status(200).json({
      success: true,
      message: "Request accepted successfully",
      request
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};
// Reject Request
exports.rejectRequest = async (req, res) => {
  try {

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    request.status = "rejected";

    await request.save();

    res.status(200).json({
      success: true,
      message: "Request rejected successfully",
      request
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};