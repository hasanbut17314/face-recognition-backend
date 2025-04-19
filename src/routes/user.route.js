import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
    inviteUser,
    loginUser,
    updateUser,
    logoutUser,
    reCreateAccessToken,
    getCurrentUser
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

export default router;
