const Request = require("../models/Request");

// Send Rental Request
exports.sendRequest = async (req, res) => {
  try {
    const { property } = req.body;

    const request = await Request.create({
      tenant: req.user.id,
      property,
    });

    res.status(201).json({
      success: true,
      message: "Rental request sent successfully",
      request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};