const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");


const {
  getMyTickets,
  getFilters,
  getSidebarCounts
} = require("../controllers/assignedTicketController");

router.get("/", authMiddleware, getMyTickets);
router.get("/filters", authMiddleware, getFilters);
router.get("/sidebar-counts", authMiddleware, getSidebarCounts);

module.exports = router;