const Request = require("../models/Request");
const Property = require("../models/Property");

/* ================= SEND REQUEST ================= */
exports.sendRentalRequest = async (req, res) => {
  try {
    const { propertyId } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const existingRequest = await Request.findOne({
      tenant: req.user.id,
      property: propertyId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "You already sent a request for this property",
      });
    }

    const request = await Request.create({
      tenant: req.user.id,
      property: propertyId,
      owner: property.ownerId,
      status: "pending",
      contactShared: false,
    });

    const populatedRequest = await Request.findById(request._id)
  .populate("property")
  .populate("owner", "name phone");

    return res.status(201).json({
  success: true,
  request: populatedRequest,
});
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================= VIEW MY REQUESTS ================= */
/* ================= VIEW MY REQUESTS ================= */
exports.viewMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({
      tenant: req.user.id,
    })
      .populate("property")
      .populate("owner", "name email phone");

    // Remove requests whose property has been deleted
    const filteredRequests = requests.filter(
      (request) => request.property !== null
    );

    // (Optional) Permanently delete those orphan requests from DB
    const deletedRequestIds = requests
      .filter((request) => request.property === null)
      .map((request) => request._id);

    if (deletedRequestIds.length > 0) {
      await Request.deleteMany({
        _id: { $in: deletedRequestIds },
      });
    }

    return res.json({
      success: true,
      requests: filteredRequests,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

/* ================= VIEW PROPERTY REQUESTS ================= */
exports.viewPropertyRequests = async (req, res) => {
  try {
    const requests = await Request.find({
      property: req.params.propertyId,
    })
      .populate("tenant", "name email phone")
      .populate("property");

    return res.json({
      success: true,
      requests,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* ================= ACCEPT REQUEST ================= */
exports.acceptRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Keep the request pending for the tenant
    request.ownerAccepted = true;

    // Share contact details immediately
    request.contactShared = true;

    await request.save();

    return res.json({
      success: true,
      message: "Contact shared. Waiting for deal completion.",
      request,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* ================= REJECT REQUEST ================= */
exports.rejectRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    request.status = "rejected";
    await request.save();

    return res.json({
      success: true,
      message: "Request rejected",
      request,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* ================= OWNER REQUESTS ================= */
exports.getOwnerRequests = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const requests = await Request.find({
      owner: ownerId
    })
      .populate("tenant", "name email phone")
      .populate("property");

    const filteredRequests = requests.filter(
      request => request.property !== null
    );

    res.json({
      success: true,
      requests: filteredRequests
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/* ================= WITHDRAW REQUEST ================= */
exports.withdrawRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    await request.deleteOne();

    return res.json({
      success: true,
      message: "Request withdrawn successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= FINALIZE DEAL ================= */
exports.finalizeDeal = async (req, res) => {
  try {
    const { decision } = req.body; // "success" or "fail"

    const request = await Request.findById(req.params.id).populate(
      "property"
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (!request.property) {
      return res.status(400).json({
        success: false,
        message: "Property not linked to request",
      });
    }

    if (decision === "success") {
      console.log("SUCCESS");
    request.status = "accepted";
    request.ownerAccepted = false;
    request.contactShared = true;

    console.log(request.status);
    console.log(request.contactShared);

    await Property.findByIdAndUpdate(request.property._id, {
    rentalStatus: "occupied",
    isHidden: true,
    status: "LOCKED",
});

} else {
  console.log("CANCEL");
    request.status = "cancelled";
    request.ownerAccepted = false;
    request.contactShared = false;

     console.log(request.status);
    console.log(request.contactShared);

    await Property.findByIdAndUpdate(request.property._id, {
        rentalStatus: "available",
    });
}

    await request.save();
  console.log("Saved request:", request);
    return res.json({
      success: true,
      message: "Deal finalized successfully",
      request,
    });
  } catch (err) {
    console.log("FINALIZE ERROR:", err.message);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
/* ================= DELETE EXPIRED REQUESTS ================= */

exports.deleteExpiredRequests = async () => {
  try {
    const expiryTime = new Date(Date.now() - 48 * 60 * 60 * 1000);

    await Request.deleteMany({
      status: "pending",
      createdAt: { $lt: expiryTime }
    });

    console.log("Expired requests deleted.");
  } catch (error) {
    console.log(error);
  }
};