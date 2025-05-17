import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  inviteUser,
  loginUser,
  loginAdmin,
  updateUser,
  logoutUser,
  reCreateAccessToken,
  getCurrentUser,
  getAllUsers,
  blockUser,
  unblockUser,
  deleteUser,
  userStats
} from "../controllers/user.controller.js";

const router = Router();

// Public routes
router.post("/user-login", loginUser);
router.post("/admin-login", loginAdmin);
router.post("/refresh-token", reCreateAccessToken);

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
