const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = "leaseflow/images";

    // Store all documents separately
    if (
      file.fieldname === "taxDocument" ||
      file.fieldname === "ownershipDocument" ||
      file.fieldname === "taxReceipt" ||
      file.fieldname === "aadhaarPan" ||
      file.fieldname === "electricityBill"
    ) {
      folder = "leaseflow/documents";
    }

    return {
      folder: folder,
      resource_type: "auto",
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`
    };
  }
});

const upload = multer({ storage });

module.exports = upload;