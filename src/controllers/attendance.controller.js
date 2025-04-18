import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Attendance } from "../models/attendance.model.js";
import { FaceProfile } from "../models/faceprofile.model.js";
import { findBestFaceMatch } from "../helpers/calculateSimilarity.js";

const markAttendanceByFaceRecognition = asyncHandler(async (req, res) => {
    const { faceData } = req.body;

    if (!Array.isArray(faceData) || faceData.length === 0) {
        throw new ApiError(400, 'Face data is required');
    }

    const faceProfile = await FaceProfile.findOne({ userId: req.user._id });

    if (!faceProfile) {
        throw new ApiError(404, 'Face profile not found');
    }

    if (!faceProfile.faceData || faceProfile.faceData.length === 0) {
        throw new ApiError(404, 'No stored face data found for comparison');
    }

    // Compare the received face data with stored face data
    const receivedFace = faceData[0]; // Using the first face data from the array
    const matchResult = findBestFaceMatch(receivedFace, faceProfile.faceData);

    // If match confidence is too low, reject
    const MINIMUM_CONFIDENCE = 70; // You can adjust this threshold

    if (!matchResult.isMatch || matchResult.confidence < MINIMUM_CONFIDENCE) {
        return res.json({
            isMatch: false,
            confidence: matchResult.confidence,
        })
    }

    // Check if attendance for today already exists
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingAttendance = await Attendance.findOne({
        userId: req.user._id,
        date: {
            $gte: today,
            $lt: tomorrow
        }
    });

    let attendance;

    if (existingAttendance) {
        // If already checked in but not checked out, then mark checkout
        if (existingAttendance.checkIn && !existingAttendance.checkOut) {
            existingAttendance.checkOut = new Date();
            attendance = await existingAttendance.save();
        } else {
            // Already checked in and out
            return res.status(200).json(
                new ApiResponse(200, existingAttendance, "Attendance already marked for today")
            );
        }
    } else {
        // Create new attendance record with check-in
        attendance = await Attendance.create({
            userId: req.user._id,
            date: new Date(),
            status: "present",
            checkIn: new Date()
        });
    }

    return res.status(200).json({
        isMatch: true,
        confidence: matchResult.confidence,
        attendance: attendance
    });
});

export {
    markAttendanceByFaceRecognition
};