const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadPath = "uploads/";

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, name + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExt = [
    ".pdf",
    ".doc",
    ".docx",
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".jfif",
    ".webp",
  ];

  const ext = path.extname(file.originalname).toLowerCase();

  console.log("UPLOAD FILE:", file.originalname, file.mimetype);

  if (allowedExt.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

module.exports = uploadMiddleware;