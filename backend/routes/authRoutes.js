const express = require("express");
const { login, getMe } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    message: "Auth routes are working",
  });
});

router.post("/login", login);

router.get("/me", authMiddleware, getMe);

module.exports = router;