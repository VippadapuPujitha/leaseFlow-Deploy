const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure folders exist (IMPORTANT)
const imagePath = path.join(__dirname, "../uploads/images");
const docPath = path.join(__dirname, "../uploads/documents");

if (!fs.existsSync(imagePath)) {
  fs.mkdirSync(imagePath, { recursive: true });
}

if (!fs.existsSync(docPath)) {
  fs.mkdirSync(docPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "images") {
      cb(null, imagePath);
    } else {
      cb(null, docPath);
    }
  },

  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname)
    );
  }
});

const upload = multer({ storage });

module.exports = upload;