const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

const {
  getMyTickets,
} = require("../controllers/myTicketController");

router.get("/", auth, getMyTickets);

module.exports = router;