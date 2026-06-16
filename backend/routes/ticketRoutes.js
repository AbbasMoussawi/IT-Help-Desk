const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const uploadMiddleware = require("../middleware/uploadMiddleware");

const {
  createTicket,
  getTickets,
  getTicketFormData,
  getTicketById,
  getTicketForEdit,
  updateTicket,
  
} = require("../controllers/ticketController");

const {
  getTicketDetailsById,
  updateStatus,
  getTicketActivity,
} = require("../controllers/ticketDetailsController");

router.post(
  "/",
  authMiddleware,
  uploadMiddleware.single("attachment"),
  createTicket
);

router.get("/", authMiddleware, getTickets);

router.get("/form-data", authMiddleware, getTicketFormData);

router.get("/:id/edit", authMiddleware, getTicketForEdit);


router.get("/:id", authMiddleware, getTicketDetailsById);

router.put("/:id/status", authMiddleware, updateStatus);
router.get("/:id/activity",authMiddleware,getTicketActivity);


router.put("/:id",authMiddleware,uploadMiddleware.single("attachment"),updateTicket);

module.exports = router;