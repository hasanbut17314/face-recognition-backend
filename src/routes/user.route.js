import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  inviteUser,
  loginUser,
  updateUser,
  logoutUser,
  reCreateAccessToken,
  getCurrentUser,
  getAllUsers,
  blockUser,
  unblockUser,
  deleteUser,
  userStats,
  resetPassword,
  verifyOtp,
  updatePassword
} from "../controllers/user.controller.js";

const router = Router();

// Public routes
router.post("/login", loginUser);
router.post("/refresh-token", reCreateAccessToken);
router.post("/reset-password", resetPassword);
router.post("/verify-otp", verifyOtp);
router.post("/update-password", updatePassword);

// Protected routes
router.use(verifyJWT);
router.post("/invite", inviteUser);
router.post("/logout", logoutUser);
router.post("/updateUser", upload.single("image"), updateUser);
router.get("/current-user", getCurrentUser);
router.get("/all-users", getAllUsers);
router.post("/block-user/:userId", blockUser);
router.post("/unblock-user/:userId", unblockUser);
router.delete("/delete-user/:userId", deleteUser);
router.get("/user-stats", userStats);

export default router;
