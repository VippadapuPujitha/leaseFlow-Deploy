const Report = require("../models/Report");

// Report Property
exports.reportProperty = async (req, res) => {
  try {
    const { property, reason } = req.body;

    const report = await Report.create({
      property,
      reportedBy: req.user.id,
      reason,
    });

    res.status(201).json({
      success: true,
      message: "Property reported successfully",
      report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Reports
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find();

    res.status(200).json({
      success: true,
      reports
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};