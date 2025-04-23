import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  markAttendanceByFaceRecognition,
  getUserAttendance,
  allAttendance,
  getAttendanceByUserId,
} from "../controllers/attendance.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT);
router.post(
  "/mark-attendance",
  upload.single("image"),
  markAttendanceByFaceRecognition
);
router.get("/user-attendance", getUserAttendance);
router.get("/all-attendance", allAttendance);
router.get("/attendance-by-user/:userId", getAttendanceByUserId);

export default router;
