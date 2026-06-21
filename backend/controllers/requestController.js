const Request = require("../models/Request");
const Property = require("../models/Property");

/* ================= SEND REQUEST ================= */
exports.sendRentalRequest = async (req, res) => {
  try {
    const { propertyId } = req.body;

    const property = await Property.findById(propertyId);
    const existingRequest = await Request.findOne({
  tenant: req.user.id,
  property: propertyId,
  status: "pending"
});

if (existingRequest) {
  return res.status(400).json({
    message: "You already sent a request for this property"
  });
}

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const request = await Request.create({
      tenant: req.user.id,
      property: propertyId,
      owner: property.ownerId,   // ✅ IMPORTANT FIX
      status: "pending",
      contactShared: false
    });

    res.status(201).json({
      success: true,
      request
    });

  } catch (err) {
  console.log("REQUEST ERROR:", err.response?.data);
  setError(
    err.response?.data?.message || "Unable to submit request."
  );
}
};

/* ================= VIEW MY REQUESTS ================= */
exports.viewMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({
  tenant: req.user.id
})
.populate("property")
.populate("owner", "name email phone");

    res.json({
      success: true,
      requests
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= VIEW PROPERTY REQUESTS ================= */
exports.viewPropertyRequests = async (req, res) => {
  try {
    const requests = await Request.find({
      property: req.params.propertyId
    })
      .populate("tenant", "name email phone")
      .populate("property");

    res.json({
      success: true,
      requests
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= ACCEPT REQUEST ================= */
exports.acceptRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // 1. Update request
    request.status = "accepted";
    request.contactShared = true;
    await request.save();

    // 2. Update property status (IMPORTANT)
    await Property.findByIdAndUpdate(request.property, {
      rentalStatus: "occupied",
      status: "LOCKED"
    });

    res.json({
      success: true,
      message: "Request accepted and property locked",
      request
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= REJECT REQUEST ================= */
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

    res.json({
      success: true,
      message: "Request rejected",
      request
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getOwnerRequests = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const requests = await Request.find({
      owner: ownerId   // ✅ FILTER BY OWNER
    })
      .populate("tenant", "name email phone")
      .populate("property");

    res.json({
      success: true,
      requests
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.withdrawRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    await request.deleteOne();

    res.json({
      success: true,
      message: "Request withdrawn successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};