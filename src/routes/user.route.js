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
} from "../controllers/user.controller.js";

const router = Router();

// Public routes
router.post("/login", loginUser);
router.post("/refresh-token", reCreateAccessToken);

// Protected routes
router.use(verifyJWT);
router.post("/invite", inviteUser);
router.post("/logout", logoutUser);
router.post("/updateUser", upload.single("image"), updateUser);
router.get("/current-user", getCurrentUser);
router.get("/all-users", getAllUsers);
router.get("/block-user/:userId", blockUser);
router.get("/unblock-user/:userId", unblockUser);

export default router;
