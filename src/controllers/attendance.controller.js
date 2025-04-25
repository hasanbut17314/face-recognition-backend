import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Attendance } from "../models/attendance.model.js";
import { User } from "../models/user.model.js";
import loadFaceApiModels from "../utils/initializeModels.js";
import compareFaces from "../utils/compareFaces.js";
import fs from "fs";

const markAttendanceByFaceRecognition = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const storedImage = user.image;
  if (!storedImage) {
    throw new ApiError(404, "User image not found");
  }

  if (!req.file) {
    throw new ApiError(400, "Image is required");
  }
  const newImage = req.file.path;

  const loadModels = await loadFaceApiModels();
  if (!loadModels) {
    fs.unlinkSync(newImage);
    throw new ApiError(500, "Failed to load face-api.js models");
  }

  const result = await compareFaces(storedImage, newImage, user._id.toString());
  fs.unlinkSync(newImage);

  if (!result.matched) {
    return res.status(200).json({
      success: true,
      isMatched: false,
      status: 200,
      message: "Face not matched",
      data: {},
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existingAttendance = await Attendance.findOne({
    userId: req.user._id,
    date: {
      $gte: today,
      $lt: tomorrow,
    },
  });

  let attendance;

  if (existingAttendance) {
    // If already checked in but not checked out, then mark checkout
    if (existingAttendance.checkIn && !existingAttendance.checkOut) {
      existingAttendance.checkOut = new Date();
      attendance = await existingAttendance.save();
    } else {
      // Already checked in and out
      return res.status(200).json({
        success: true,
        isMatched: true,
        isAlreadyMarked: true,
        status: 200,
        message: "Already checked in and out",
        data: existingAttendance,
      });
    }
  } else {
    // Create new attendance record with check-in
    attendance = await Attendance.create({
      userId: req.user._id,
      date: new Date(),
      status: "present",
      checkIn: new Date(),
    });
  }

  return res.status(200).json({
    success: true,
    isMatched: true,
    status: 200,
    isAlreadyMarked: existingAttendance ? true : false,
    message: "Attendance marked successfully",
    data: attendance,
  });
});

const getUserAttendance = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, date, status } = req.query;

  const query = {
    userId: req.user._id,
  };

  if (date) {
    query.date = new Date(date);
  }

  if (status && (status === "present" || status === "absent")) {
    query.status = status;
  }

  const attendances = await Attendance.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 })
    .populate("userId", "name email image department");

  const total = await Attendance.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        attendances,
        pagination: {
          page,
          limit,
          total,
        },
      },
      "Attendances fetched successfully"
    )
  );
});

const allAttendance = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, date, status } = req.query;

  if (req.user.role !== "admin") {
    throw new ApiError(401, "Unauthorized request");
  }

  const query = {};

  if (date) {
    query.date = new Date(date);
  }

  if (status && (status === "present" || status === "absent")) {
    query.status = status;
  }

  const attendances = await Attendance.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 })
    .populate("userId", "name email image department");

  const total = await Attendance.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        attendances,
        pagination: {
          page,
          limit,
          total,
        },
      },
      "Attendances fetched successfully"
    )
  );
});

const getAttendanceByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const query = {
    userId,
  };

  const attendance = await Attendance.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 })
    .populate("userId", "name email image department");

  const total = await Attendance.countDocuments(query);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { attendance, pagination: { page, limit, total } },
        "Attendance fetched successfully"
      )
    );
});

export {
  markAttendanceByFaceRecognition,
  getUserAttendance,
  allAttendance,
  getAttendanceByUserId,
};
