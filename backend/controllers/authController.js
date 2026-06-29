const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    
    const result = await pool.query(
      `
      SELECT 
        u."ID",
        u."FullName",
        u."Email",
        u."PasswordHash",
        u."IsActive",
        u."IsOnline",
        u."Image",
        r."RoleName"
      FROM "user" u
      INNER JOIN role r ON u."RoleId" = r."ID"
      WHERE u."Email" = $1
      AND u."IsActive" = TRUE
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    
    if (!user.IsActive) {
      return res.status(403).json({
        message: "Account is disabled",
      });
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.PasswordHash
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }
    await pool.query(
      `UPDATE "user" SET "IsOnline" = true WHERE "ID" = $1`,
      [user.ID]
    );

    
    const token = jwt.sign(
      {
        userId: user.ID,
        role: user.RoleName,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.ID,
        fullName: user.FullName,
        email: user.Email,
        role: user.RoleName,
        isOnline: true,
        image: user.Image
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Server error during login",
    });
  }
};

const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        u."ID",
        u."FullName",
        u."Email",
        u."IsActive",
        u."IsOnline",
        u."Image",
        r."RoleName"
      FROM "user" u
      INNER JOIN role r ON u."RoleId" = r."ID"
      WHERE u."ID" = $1
      `,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = result.rows[0];

    return res.status(200).json({
      user: {
        id: user.ID,
        fullName: user.FullName,
        email: user.Email,
        role: user.RoleName || "No role",
        isActive: user.IsActive,
        isOnline: user.IsOnline,
        image: user.Image
      },
    });

  } catch (error) {
    console.error("Get me error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const logout = async (req, res) => {
  try {
    await pool.query(
      `UPDATE "user" SET "IsOnline" = false WHERE "ID" = $1`,
      [req.user.userId]
    );

    return res.status(200).json({
      message: "Logged out successfully",
    });

  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  login,
  getMe,
  logout,
};