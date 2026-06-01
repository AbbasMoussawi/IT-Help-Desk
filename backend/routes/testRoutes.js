const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    message: "Test routes are working",
  });
});

router.get(
  "/admin",
  authMiddleware,
  roleMiddleware("Admin"),
  (req, res) => {
    res.json({
      message: "Admin route access granted",
      user: req.user,
    });
  }
);

router.get(
  "/manager",
  authMiddleware,
  roleMiddleware("Manager"),
  (req, res) => {
    res.json({
      message: "Manager route access granted",
      user: req.user,
    });
  }
);

router.get(
  "/support",
  authMiddleware,
  roleMiddleware("IT Support Agent"),
  (req, res) => {
    res.json({
      message: "IT Support Agent route access granted",
      user: req.user,
    });
  }
);

router.get(
  "/employee",
  authMiddleware,
  roleMiddleware("Employee"),
  (req, res) => {
    res.json({
      message: "Employee route access granted",
      user: req.user,
    });
  }
);

module.exports = router;