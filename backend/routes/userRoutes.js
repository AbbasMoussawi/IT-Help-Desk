const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getMe,
  updateProfile,
  changePassword,
  uploadProfileImage,
  removeProfileImage,
} = require("../controllers/userController");

router.get("/", authMiddleware, getAllUsers);
router.post("/", authMiddleware, createUser);
router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, updateProfile);
router.post("/change-password", authMiddleware, changePassword);
router.post(
  "/upload-image",
  authMiddleware,
  upload.single("image"),
  uploadProfileImage
);
router.delete("/remove-image", authMiddleware, removeProfileImage);
router.get("/:id", authMiddleware, getUserById);
router.put("/:id", authMiddleware, updateUser);
router.delete("/:id", authMiddleware, deleteUser);

module.exports = router;