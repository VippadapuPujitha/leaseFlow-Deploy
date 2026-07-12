const path = require("path");

const Property = require("../models/Property");

const OWNER_FIELDS = "name email phone role";

const isRemoteUrl = (value) => /^(https?:)?\/\//i.test(value) || value.startsWith('data:');

const buildPublicFileUrl = (req, filePath) => {
  if (!filePath) {
    return "";
  }

  if (isRemoteUrl(filePath)) {
    return filePath;
  }

  const normalizedPath = String(filePath).replace(/\\/g, "/");
  const filename = path.basename(normalizedPath);
  const isImage = /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(filename);
  const folder = isImage ? "images" : "documents";

  return `${req.protocol}://${req.get("host")}/uploads/${folder}/${filename}`;
};

const formatProperty = (req, propertyDoc) => {
  const property = propertyDoc.toObject ? propertyDoc.toObject() : propertyDoc;

  return {
    ...property,
    ownerDetails:
      property.ownerId && typeof property.ownerId === "object"
        ? property.ownerId
        : null,
    imageUrls: Array.isArray(property.images)
      ? property.images.map((imagePath) => buildPublicFileUrl(req, imagePath))
      : [],
    taxDocumentUrl: buildPublicFileUrl(req, property.taxDocument),
    ownershipDocumentUrl: buildPublicFileUrl(req, property.ownershipDocument),
  };
};

const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find()
      .populate("ownerId", OWNER_FIELDS)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      properties: properties.map((property) => formatProperty(req, property)),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getVerificationQueue = async (req, res) => {
  try {
    // Return properties that are awaiting admin review.
    // Treat any property that is NOT 'verified' and NOT 'rejected' as pending review
    const properties = await Property.find({ verificationStatus: { $nin: ["verified", "rejected"] } })
      .populate("ownerId", OWNER_FIELDS)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      properties: properties.map((property) => formatProperty(req, property)),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "ownerId",
      OWNER_FIELDS
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    res.status(200).json({
      success: true,
      property: formatProperty(req, property),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const verifyProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "ownerId",
      OWNER_FIELDS
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    property.verificationStatus = "verified";
    property.rejectionReason = "";

    await property.save();

    res.status(200).json({
      success: true,
      message: "Property verified successfully",
      property: formatProperty(req, property),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const rejectProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "ownerId",
      OWNER_FIELDS
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    property.verificationStatus = "rejected";
    property.rejectionReason = (req.body.rejectionReason || "").trim();

    await property.save();

    res.status(200).json({
      success: true,
      message: "Property rejected successfully",
      property: formatProperty(req, property),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    await property.deleteOne();

    res.status(200).json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllProperties,
  getVerificationQueue,
  getPropertyById,
  verifyProperty,
  rejectProperty,
  deleteProperty,
};
