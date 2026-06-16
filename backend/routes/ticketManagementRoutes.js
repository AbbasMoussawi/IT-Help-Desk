const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getAllTickets,
  getTicketFilters,
  deleteTicket
} = require("../controllers/ticketManagementController");

router.get(
  "/",
  authMiddleware,
  getAllTickets
);
router.get("/filters", getTicketFilters);
router.delete("/:id", authMiddleware, deleteTicket);

module.exports = router;