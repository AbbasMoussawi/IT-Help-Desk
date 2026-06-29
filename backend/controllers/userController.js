const pool = require("../config/db");
const bcrypt = require("bcrypt");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");


const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u."ID",
        u."FullName",
        u."Email",
        u."Image",
        r."RoleName" AS "Role",
        CASE 
          WHEN u."IsOnline" = true THEN 'Online'
          ELSE 'Offline'
        END AS "IsOnline"
      FROM "user" u
      LEFT JOIN role r ON u."RoleId" = r."ID"
      WHERE u."IsActive" = true
      ORDER BY u."ID" DESC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;
    const roleRes = await pool.query(
      `SELECT "ID" FROM role WHERE "RoleName" = $1`,
      [role]
    );

    if (roleRes.rows.length === 0) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const roleId = roleRes.rows[0].ID;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `
      INSERT INTO "user"
      ("FullName", "Email", "PasswordHash", "RoleId", "IsActive")
      VALUES ($1,$2,$3,$4,true)
      RETURNING "ID", "FullName", "Email"
      `,
      [fullName, email, hashedPassword, roleId]
    );

    return res.status(201).json({
      message: "User created successfully",
      user: result.rows[0],
    });

  } catch (err) {
    console.log("CREATE USER ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    `
    SELECT 
      u."ID",
      u."FullName",
      u."Email",
      u."Image",
      r."RoleName" AS "Role"
    FROM "user" u
    LEFT JOIN role r ON u."RoleId" = r."ID"
    WHERE u."ID" = $1 AND u."IsActive" = true
    `,
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  const user = result.rows[0];

  res.json({
    user: {
      id: user.ID,
      fullName: user.FullName,
      email: user.Email,
      role: user.Role,
      image: user.Image,
    },
  });
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { fullName, role } = req.body;

  const roleRes = await pool.query(
    `SELECT "ID" FROM role WHERE "RoleName" = $1`,
    [role]
  );

  const roleId = roleRes.rows[0].ID;

  await pool.query(
    `
    UPDATE "user"
    SET "FullName" = $1,
        "RoleId" = $2,
        "UpdatedAt" = NOW()
    WHERE "ID" = $3
    `,
    [fullName, roleId, id]
  );

  res.json({ message: "User updated successfully" });
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `
      UPDATE "user"
      SET "IsActive" = false
      WHERE "ID" = $1
      `,
      [id]
    );

    res.json({
      message: "User deactivated successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};
const getMe = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `
      SELECT
        u."ID",
        u."FullName",
        u."Email",
        u."Image",
        u."IsOnline",
        u."IsActive",
        r."RoleName" AS "Role"
      FROM "user" u
      LEFT JOIN role r ON u."RoleId" = r."ID"
      WHERE u."ID" = $1 AND u."IsActive" = true
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];
    res.json({
      user: {
        id: user.ID,
        fullName: user.FullName,
        email: user.Email,
        role: user.Role,
        isOnline: user.IsOnline,
        isActive: user.IsActive,
        image: user.Image,
      },
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fullName, email } = req.body;

    await pool.query(
      `
      UPDATE "user"
      SET "FullName" = $1,
          "Email" = $2,
          "UpdatedAt" = NOW()
      WHERE "ID" = $3 AND "IsActive" = true
      `,
      [fullName, email, userId]
    );
    const updatedUser = await pool.query(
      `
      SELECT
        u."ID",
        u."FullName",
        u."Email",
        u."Image",
        r."RoleName" AS "Role"
      FROM "user" u
      LEFT JOIN role r
        ON u."RoleId" = r."ID"
      WHERE u."ID" = $1
      `,
      [userId]
    );

    res.json({
      message: "Profile updated successfully",
      user: updatedUser.rows[0],
    });

    

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { oldPassword, newPassword } = req.body;

    const userRes = await pool.query(
      `SELECT "PasswordHash" FROM "user" WHERE "ID" = $1`,
      [userId]
    );

    const user = userRes.rows[0];

    const isMatch = await bcrypt.compare(oldPassword, user.PasswordHash);

    if (!isMatch) {
      return res.status(400).json({ message: "Old password is wrong" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `
      UPDATE "user"
      SET "PasswordHash" = $1,
          "UpdatedAt" = NOW()
      WHERE "ID" = $2
      `,
      [hashed, userId]
    );

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    const inputPath = req.file.path;

    const fileName = `user-${userId}-${Date.now()}.jpg`;
    const outputPath = path.join("uploads", fileName);

    await sharp(inputPath)
      .resize(300, 300)
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    fs.unlinkSync(inputPath);

    await pool.query(
      `
      UPDATE "user"
      SET "Image" = $1,
          "UpdatedAt" = NOW()
      WHERE "ID" = $2
      `,
      [fileName, userId]
    );

    res.json({
      message: "Profile image uploaded successfully",
      imageUrl: fileName,
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

const removeProfileImage = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("REQ USER:", req.user);
    await pool.query(
      `
      UPDATE "user"
      SET "Image" = NULL,
          "UpdatedAt" = NOW()
      WHERE "ID" = $1
      `,
      [userId]
    );

    res.json({ message: "Image removed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getMe,
  updateProfile,
  changePassword,
  uploadProfileImage,
  removeProfileImage
};