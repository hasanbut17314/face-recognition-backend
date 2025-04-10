import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Attendance } from "../models/attendance.model.js";
import { User } from "../models/user.model.js";
import { FaceProfile } from "../models/faceprofile.model.js";
import { Vision } from '@google-cloud/vision';
import { calculateFaceSimilarity } from "../helpers/calculateSimilarity.js";

const visionClient = new Vision.ImageAnnotatorClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

const markAttendanceByFaceRecognition = asyncHandler(async (req, res) => {
    const imageFile = req.file;

    if (!imageFile) {
        throw new ApiError(400, 'Image file is required');
    }

    const [faceDetectionResult] = await visionClient.faceDetection(imageFile.path);
    const faces = faceDetectionResult.faceAnnotations;

    if (!faces || faces.length === 0) {
        throw new ApiError(400, 'No face detected in the image');
    }

    const faceProfile = await FaceProfile.findOne({ userId: req.user._id });
    const [similarityResult] = await visionClient.faceDetection(faceProfile.image);
    const storedFaces = similarityResult.faceAnnotations;

    if (storedFaces && storedFaces.length > 0) {
        const similarityScore = calculateFaceSimilarity(faces[0], storedFaces[0]);

        if (similarityScore > 0.7) {
            matchedUser = req.user;
        }
    }

    if (!matchedUser) {
        throw new ApiError(404, 'No matching user found');
    }

    const existingAttendance = await Attendance.findOne({
        userId: matchedUser._id,
        date: {
            $gte: new Date().setHours(0, 0, 0, 0),
            $lt: new Date().setHours(23, 59, 59, 999)
        }
    });

    let attendanceRecord;
    if (!existingAttendance) {
        attendanceRecord = await Attendance.create({
            userId: matchedUser._id,
            status: 'present',
            checkIn: new Date(),
            date: new Date()
        });
    } else if (!existingAttendance.checkOut) {
        attendanceRecord = await Attendance.findByIdAndUpdate(
            existingAttendance._id,
            {
                checkOut: new Date(),
                status: 'present'
            },
            { new: true }
        );
    } else {
        throw new ApiError(400, 'Attendance already marked for today');
    }

    return res.status(200).json(
        new ApiResponse(200, attendanceRecord, 'Attendance marked successfully')
    );
});

export {
    markAttendanceByFaceRecognition
}

