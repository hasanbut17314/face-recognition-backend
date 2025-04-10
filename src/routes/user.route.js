import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
    registerUser,
    loginUser,
    logoutUser,
    reCreateAccessToken,
    uploadFaceProfile
} from "../controllers/user.controller.js";

const router = Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", reCreateAccessToken);

// Protected routes
router.use(verifyJWT);
router.post("/logout", logoutUser);
router.post("/upload-face-profile", upload.single("image"), uploadFaceProfile);

export default router;
