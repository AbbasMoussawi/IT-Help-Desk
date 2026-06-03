const express = require("express");
const router = express.Router();

const {
  forgotPassword,
  verifyCode,
  resetPassword
} = require("../controllers/passwordController");

router.post("/forgot-password", forgotPassword);
router.post("/verify-code", verifyCode);
router.post("/reset-password", resetPassword);

module.exports = router;