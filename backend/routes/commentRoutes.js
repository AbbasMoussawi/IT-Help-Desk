const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  addComment,
  getComments
} = require("../controllers/commentDetailsController");

router.post("/", authMiddleware, addComment);

router.get("/:ticketId", authMiddleware, getComments);

module.exports = router;