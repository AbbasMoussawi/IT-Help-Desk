const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

/* FORGOT PASSWORD */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const result = await pool.query(
      `SELECT "ID", "IsActive"
       FROM "user"
       WHERE "Email" = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Email not found",
      });
    }

    const user = result.rows[0];

    if (!user.IsActive) {
      return res.status(403).json({
        message: "Account is disabled",
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000);

    await pool.query(
      `INSERT INTO verify_code
      ("Email", "Code", "ExpiresAt", "IsUsed")
      VALUES
      ($1, $2, NOW() + INTERVAL '10 minutes', false)`,
      [email, code]
    );

    console.log("RESET CODE:", code);

    return res.status(200).json({
      message: "Code sent successfully",
    });

  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

/* VERIFY CODE */
const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        message: "Email and code are required",
      });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM verify_code
      WHERE "Email" = $1
      AND "Code" = $2
      AND "IsUsed" = false
      AND "ExpiresAt" > NOW()
      ORDER BY "ID" DESC
      LIMIT 1
      `,
      [email, code]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid or expired code",
      });
    }

    const resetToken = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      {
        expiresIn: "10m",
      }
    );

    return res.status(200).json({
      message: "Code verified successfully",
      resetToken,
    });

  } catch (error) {
    console.error("Verify code error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

/* RESET PASSWORD */
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        message: "Missing data",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(
        resetToken,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    const email = decoded.email;

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    const result = await pool.query(
      `
      UPDATE "user"
      SET "PasswordHash" = $1
      WHERE "Email" = $2
      `,
      [hashedPassword, email]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await pool.query(
      `
      UPDATE verify_code
      SET "IsUsed" = true
      WHERE "Email" = $1
      `,
      [email]
    );

    return res.status(200).json({
      message: "Password reset successfully",
    });

  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  forgotPassword,
  verifyCode,
  resetPassword,
};