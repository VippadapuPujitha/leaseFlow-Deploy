const Property = require("../models/Property");
const fs = require("fs");
const path = require("path");

const createProperty = async (req, res) => {
  try {
    console.log("FILES:", req.files);
    console.log("BODY:", req.body);

    const images = req.files?.images?.map(file => file.path) || [];

    const property = await Property.create({
  title: req.body.title,
  address: req.body.address,
  city: req.body.city,
  rent: req.body.rent,
  propertyType: req.body.propertyType,
  description: req.body.description,
  bedrooms: req.body.bedrooms,
bathrooms: req.body.bathrooms,
  latitude: req.body.latitude,
  longitude: req.body.longitude,

  images,

  taxReceipt: req.files?.taxReceipt?.[0]?.path || "",
  aadhaarPan: req.files?.aadhaarPan?.[0]?.path || "",
  electricityBill: req.files?.electricityBill?.[0]?.path || "",

  taxDocument: req.files?.taxDocument?.[0]?.path || "",
  ownershipDocument: req.files?.ownershipDocument?.[0]?.path || "",

  ownerId: req.user.id,

  verificationStatus: "not_requested",
  rentalStatus: "available",
  isHidden: false
});
    console.log("PROPERTY CREATED:", property);
    res.status(201).json({
      success: true,
      property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getDocument = (req, res) => {
  try {
    const filename = req.params.filename;

    const filePath = path.join(
      __dirname,
      "../uploads/documents",
      filename
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found"
      });
    }

    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find().select("-ownerId");

    res.status(200).json({
      success: true,
      count: properties.length,
      properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getPendingProperties = async (req, res) => {
  try {
    const properties = await Property.find({ verificationStatus: "pending" });

    res.status(200).json({
      success: true,
      count: properties.length,
      properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    const googleMapsLink =
      property.latitude && property.longitude
        ? `https://www.google.com/maps?q=${property.latitude},${property.longitude}`
        : null;

    res.status(200).json({
      success: true,
      property,
      googleMapsLink
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    if (property.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can edit only your own property"
      });
    }

    property.title = req.body.title;
    property.address = req.body.address;
    property.city = req.body.city;
    property.rent = req.body.rent;
    property.propertyType = req.body.propertyType;
    property.description = req.body.description;
    property.bedrooms = req.body.bedrooms;
property.bathrooms = req.body.bathrooms;
    property.latitude = req.body.latitude;
    property.longitude = req.body.longitude;

    await property.save();

    res.status(200).json({
      success: true,
      property
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }
    if (property.ownerId.toString() !== req.user.id) {
  return res.status(403).json({
    success: false,
    message: "You can delete only your own property"
  });
}

    await property.deleteOne();

    res.status(200).json({
      success: true,
      message: "Property deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const approveProperty = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
  return res.status(403).json({
    success: false,
    message: "Only admin can approve properties"
  });
}
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }
    if (property.verificationStatus === "verified") {
  return res.status(400).json({
    success: false,
    message: "Property is already verified"
  });
}
    property.status = "ACTIVE";
    property.verificationStatus = "verified";
    properrty.rejectionReason="";
    await property.save();

    res.status(200).json({
      success: true,
      message: "Property approved successfully",
      property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
const getOwnerProperties = async (req, res) => {
  try {
    console.log("Logged in user:", req.user.id);

    const properties = await Property.find({
      ownerId: req.user.id
    });

    console.log("Properties found:", properties.length);

    res.status(200).json({
      success: true,
      count: properties.length,
      properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
const finalizeRental = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }
    if (property.ownerId.toString() !== req.user.id) {
  return res.status(403).json({
    success: false,
    message: "You can finalize only your own property"
  });
}
if (property.rentalStatus !== "available") {
  return res.status(400).json({
    success: false,
    message: "Property is already occupied"
  });
}
if (property.verificationStatus !== "verified") {
  return res.status(400).json({
    success: false,
    message: "Only verified properties can be finalized"
  });
}
if (decision === "success") {

  request.status = "occupied";
  request.contactShared = true;

  request.property.rentalStatus = "occupied";
  request.property.isHidden = true;

  await request.property.save();
}
if (decision === "fail") {
  request.status = "rejected";
  request.contactShared = false;
}
    property.rentalStatus = "occupied";
    property.isHidden = true;
    property.status="LOCKED";
    await property.save();

    res.status(200).json({
      success: true,
      message: "Property marked as occupied",
      property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
const togglePropertyVisibility = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }
    if (property.ownerId.toString() !== req.user.id) {
  return res.status(403).json({
    success: false,
    message: "You can modify visibility only for your own property"
  });
}
if (property.rentalStatus === "occupied") {
  return res.status(400).json({
    success: false,
    message: "Occupied properties cannot change visibility"
  });
}
    property.isHidden = !property.isHidden;

    await property.save();

    res.status(200).json({
      success: true,
      message: property.isHidden
        ? "Property hidden successfully"
        : "Property visible successfully",
      property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
const rejectProperty = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
  return res.status(403).json({
    success: false,
    message: "Only admin can reject properties"
  });
}
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }
    if (property.verificationStatus === "rejected") {
  return res.status(400).json({
    success: false,
    message: "Property is already rejected"
  });
}
    property.status = "REJECTED";
    property.verificationStatus = "rejected";
    const { rejectionReason } = req.body;
if (!rejectionReason) {
  return res.status(400).json({
    success: false,
    message: "Rejection reason is required"
  });
}

property.status = "REJECTED";
property.verificationStatus = "rejected";
property.rejectionReason = rejectionReason;
    property.rejectionReason = req.body.rejectionReason || "";

    await property.save();

    res.status(200).json({
      success: true,
      message: "Property rejected successfully",
      property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
const requestVerification = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }
    if (!property.taxDocument || !property.ownershipDocument) {
  return res.status(400).json({
    success: false,
    message: "Upload Tax Document and Ownership Document before requesting verification"
  });
}
if (property.verificationStatus === "pending") {
  return res.status(400).json({
    success: false,
    message: "Verification request is already pending"
  });
}

if (property.verificationStatus === "verified") {
  return res.status(400).json({
    success: false,
    message: "Property is already verified"
  });
}
  if (property.ownerId.toString() !== req.user.id) {
  return res.status(403).json({
    success: false,
    message: "You can request verification only for your own property"
  });
}
    property.verificationStatus = "pending";
    property.rejectionReason = "";

    await property.save();

    res.status(200).json({
      success: true,
      message: "Verification request submitted successfully",
      property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
const getAvailableProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      rentalStatus: "available",
      isHidden: false
    });

    res.status(200).json({
      success: true,
      count: properties.length,
      properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const searchProperties = async (req, res) => {
  try {
    const { propertyType, maxRent, location } = req.query;

    let filter = {
      rentalStatus: "available",
      isHidden: false
    };

    if (propertyType) {
      filter.propertyType = propertyType;
    }

    if (maxRent) {
      filter.rent = { $lte: Number(maxRent) };
    }

    if (location) {
      filter.address = {
        $regex: location,
        $options: "i"
      };
    }

    const properties = await Property.find(filter);

    res.status(200).json({
      success: true,
      count: properties.length,
      properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
const getOwnerStats = async (req, res) => {
  try {
    const  ownerId  = req.user.id;

    const totalProperties = await Property.countDocuments({ ownerId });

    const activeProperties = await Property.countDocuments({
      ownerId,
      status: "ACTIVE"
    });

    const pendingProperties = await Property.countDocuments({
      ownerId,
      status: "PENDING"
    });

    const rentedProperties = await Property.countDocuments({
      ownerId,
      rentalStatus: "occupied"
    });

    const hiddenProperties = await Property.countDocuments({
      ownerId,
      isHidden: true
    });

    res.status(200).json({
      success: true,
      stats: {
        totalProperties,
        activeProperties,
        pendingProperties,
        occupiedProperties,
        hiddenProperties
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const unhideProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      {
        isHidden: false,
        rentalStatus: "available"
      },
      { new: true }
    );

    res.json({
      success: true,
      property
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
module.exports = {
  createProperty,
  getAllProperties,
  getPendingProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  approveProperty,
  rejectProperty,
  getDocument,
  getOwnerProperties,
  finalizeRental,
  togglePropertyVisibility,
  requestVerification,
  getAvailableProperties,
  searchProperties,
  getOwnerStats,
  unhideProperty
};