import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Attendance } from "../models/attendance.model.js";
import { User } from "../models/user.model.js";
import { FaceProfile } from "../models/faceprofile.model.js";
import Vision from '@google-cloud/vision';
import { calculateFaceSimilarity } from "../helpers/calculateSimilarity.js";
import { downloadImageFromUrl, cleanupTempFile } from "../utils/imageUtils.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Google Vision client
const visionClient = new Vision.ImageAnnotatorClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

/**
 * Mark attendance using face recognition
 * This function:
 * 1. Detects faces in the uploaded image
 * 2. Retrieves the user's stored face profile
 * 3. Compares the detected face with the stored face
 * 4. Marks attendance if the faces match
 */
const markAttendanceByFaceRecognition = asyncHandler(async (req, res) => {
    console.log("Starting face recognition attendance process");

    const imageFile = req.file;
    let storedFacePath = null;

    if (!imageFile) {
        throw new ApiError(400, 'Image file is required');
    }

    // Get the current user's ID from the authenticated request
    const userId = req.user._id;
    console.log(`Processing attendance for user ID: ${userId}`);

    try {
        // Detect faces in the uploaded image
        console.log("Detecting faces in uploaded image");
        const [faceDetectionResult] = await visionClient.faceDetection(imageFile.path);
        const faces = faceDetectionResult.faceAnnotations;

        if (!faces || faces.length === 0) {
            throw new ApiError(400, 'No face detected in the image');
        }

        console.log(`Detected ${faces.length} face(s) in the uploaded image`);

        // Get the user's face profile
        const faceProfile = await FaceProfile.findOne({ userId });

        if (!faceProfile) {
            throw new ApiError(404, 'Face profile not found. Please register your face first.');
        }

        console.log("Retrieved user's face profile");

        // Download the stored face image from Cloudinary URL
        console.log("Downloading stored face image from Cloudinary");
        storedFacePath = await downloadImageFromUrl(faceProfile.image, `face_${userId}`);
        console.log(`Downloaded stored face image to: ${storedFacePath}`);

        // Get face detection for the stored face
        console.log("Detecting faces in stored image");
        const [storedFaceResult] = await visionClient.faceDetection(storedFacePath);
        const storedFaces = storedFaceResult.faceAnnotations;

        if (!storedFaces || storedFaces.length === 0) {
            throw new ApiError(500, 'Could not detect face in stored profile image');
        }

        console.log(`Detected ${storedFaces.length} face(s) in the stored image`);

        // Calculate similarity between the detected face and stored face
        console.log("Comparing faces for similarity");
        const similarityScore = calculateFaceSimilarity(faces[0], storedFaces[0]);
        console.log(`Face similarity score: ${similarityScore}`);

        // Define a threshold for face matching (adjust as needed)
        const SIMILARITY_THRESHOLD = 0.7;

        if (similarityScore < SIMILARITY_THRESHOLD) {
            throw new ApiError(401, 'Face verification failed. The detected face does not match your profile.');
        }

        console.log("Face verification successful");

        // Check if attendance already exists for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const existingAttendance = await Attendance.findOne({
            userId,
            date: {
                $gte: today,
                $lt: tomorrow
            }
        });

        let attendanceRecord;

        if (!existingAttendance) {
            // Create new attendance record (check-in)
            console.log("Creating new attendance record (check-in)");
            attendanceRecord = await Attendance.create({
                userId,
                status: 'present',
                checkIn: new Date(),
                date: new Date()
            });
        } else if (!existingAttendance.checkOut) {
            // Update existing attendance record (check-out)
            console.log("Updating existing attendance record (check-out)");
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
    } catch (error) {
        console.error("Error in face recognition attendance:", error);
        throw error;
    } finally {
        // Clean up temporary files
        cleanupTempFile(imageFile.path);
        if (storedFacePath) {
            cleanupTempFile(storedFacePath);
        }
    }
});

export {
    markAttendanceByFaceRecognition
}

