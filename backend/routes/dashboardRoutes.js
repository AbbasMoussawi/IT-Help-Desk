const express = require("express");
const router = express.Router();

const {
  getEmployeeRecentTickets,
  getAssignedTickets,
  getUrgentTickets,
  getDashboardCounters,
  getActivity,
  getUnassignedTickets,
  getHighPriorityTickets,
  getTeamPerformance,
  getUserOverview,
  getTicketCategories,
  getRecentNotifications,
} = require("../controllers/dashboardController");

const verifyToken = require("../middleware/authMiddleware");

router.get(
  "/employee/recent-tickets",
  verifyToken,
  getEmployeeRecentTickets
);
router.get(
  "/employee/activity",
  verifyToken,
  getActivity
);
router.get(
  "/assigned-tickets",
  verifyToken,
  getAssignedTickets
);
router.get(
  "/urgent-tickets",
  verifyToken,
  getUrgentTickets
);
router.get(
  "/counters",
  verifyToken,
  getDashboardCounters
);
router.get(
  "/activity",
  verifyToken,
  getActivity
);
router.get(
  "/unassigned-tickets",
   verifyToken,
   getUnassignedTickets
);
router.get(
  "/high-priority-tickets",
  verifyToken,
  getHighPriorityTickets
);
router.get(
  "/team-performance",
  verifyToken,
  getTeamPerformance
);
router.get(
  "/user-overview",
  verifyToken,
  getUserOverview
);
router.get(
  "/ticket-categories",
  verifyToken,
  getTicketCategories
);
router.get(
  "/notifications",
  verifyToken,
  getRecentNotifications
);

module.exports = router;