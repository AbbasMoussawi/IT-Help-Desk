const express = require("express");
const { getPriorities } = require("../controllers/priorityController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getPriorities);

module.exports = router;