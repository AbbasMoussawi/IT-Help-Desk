const express = require("express");
const {
  createTicket,
  getTickets,
  updateTicket,
} = require("../controllers/ticketController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("Employee", "Manager", "Admin"),
  createTicket
);

router.get("/", authMiddleware, getTickets);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("Employee", "Manager", "Admin", "IT Support Agent"),
  updateTicket
);

module.exports = router;