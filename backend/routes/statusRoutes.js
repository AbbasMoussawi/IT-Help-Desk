const express = require("express");
const { getStatuses } = require("../controllers/statusController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getStatuses);

module.exports = router;