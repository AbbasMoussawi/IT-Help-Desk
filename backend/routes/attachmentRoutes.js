const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const { uploadAttachment } = require("../controllers/attachmentController");

const auth = require("../middleware/authMiddleware");

router.post(
  "/",
  auth,
  upload.single("file"),
  uploadAttachment
);

module.exports = router;