import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { markAttendanceByFaceRecognition } from "../controllers/attendance.controller.js";

const router = Router();

// Apply JWT verification middleware to all routes
router.use(verifyJWT);

// Route for marking attendance using face recognition
router.post(
    "/mark-attendance",
    upload.single("image"),
    markAttendanceByFaceRecognition
);

export default router; 