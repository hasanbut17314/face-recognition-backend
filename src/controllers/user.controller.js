import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { sendEmail } from "../utils/email.js";

const options = {
  httpOnly: true,
  secure: true,
};

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const inviteUser = asyncHandler(async (req, res) => {
  // if (!req.user || req.user.role !== "admin") {
  //     throw new ApiError(401, "Unauthorized request")
  // }

  const { registerationNo, password, email, role } = req.body;
  if (
    [registerationNo, password, email, role].some(
      (value) => value.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({ registerationNo });
  if (existingUser) {
    throw new ApiError(
      400,
      "User already exists with this registeration number"
    );
  }

  const user = await User.create({
    registerationNo,
    password,
    email,
    role,
    isFirstLogin: true,
    status: "pending",
  });

  const mail = await sendEmail({
    to: email,
    subject: "Account Invited",
    html: `
            <h1>Welcome to Face Recognition Attendance System</h1>
            <p>We are excited to have you join our community. Please use the following credentials to log in to our Face Recognition Attendance System app:</p>
            <ul>
                <li><strong>Registeration No:</strong> ${registerationNo}</li>
                <li><strong>Password:</strong> ${password}</li>
            </ul>
            <p>If you have any questions or need further assistance, please don't hesitate to contact our support team.</p>
            <p>Thank you for choosing our platform!</p>
        `,
  });
  if (!mail.success) {
    throw new ApiError(403, "Failed to send email! Provide valid email");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, user, "User invited successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { registerationNo, password } = req.body;

  if (!registerationNo || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findOne({ registerationNo });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (user.isBlocked) {
    throw new ApiError(401, "Your account is Blocked by Administration.");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );
  const updatedUser = await User.findById(user._id).select(
    "-password -refreshToken -__v"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: updatedUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const updateUser = asyncHandler(async (req, res) => {
  const { name, mobileNo, department, password } = req.body;
  if (!name) {
    throw new ApiError(400, "Name is required");
  }

  if (!req.file) {
    throw new ApiError(400, "Image is required");
  }

  let image = null;
  if (req.file) {
    const result = await uploadOnCloudinary(req.file.path);
    image = result?.secure_url;
  }

  const user = await User.findById(req.user._id);

  user.name = name;
  user.mobileNo = mobileNo;
  user.department = department;
  user.isFirstLogin = false;
  user.status = "active";

  if (password) {
    user.password = password;
  }

  if (image) {
    user.image = image;
  }

  await user.save();

  user.password = undefined;
  user.refreshToken = undefined;

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User updated successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized request");
  }

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out successfully"));
});

const reCreateAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefereshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json({
        status: 200,
        success: true,
        accessToken,
        refreshToken: newRefreshToken,
        message: "Recreate access token successfully",
      });
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken -__v"
  );
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User found successfully"));
});

const blockUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  user.isBlocked = true;
  user.status = "blocked";
  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User blocked successfully"));
});

const unblockUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  user.isBlocked = false;
  user.status = "active";
  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User unblocked successfully"));
});

const getAllUsers = asyncHandler(async (req, res) => {
  // const { page = 1, limit = 10 } = req.query;
  // q='name'
  const { q } = req.query;

  const query = {
    role: "user",
  };

  if (q && q.trim() !== "") {
    query.name = { $regex: q, $options: "i" };
    query.registerationNo = { $regex: q, $options: "i" };
    query.email = { $regex: q, $options: "i" };
  }

  const users = await User.find(query).sort({ createdAt: -1 })
  // .skip((page - 1) * limit)
  // .limit(limit)

  const total = await User.countDocuments(query);

  return res
    .status(200)
    .json(
      new ApiResponse(200, { users, total }, "All users fetched successfully")
    );
});

const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User deleted successfully"));
});

const userStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments({ role: "user" });
  const totalActiveUsers = await User.countDocuments({
    role: "user",
    status: "active",
  });
  const totalBlockedUsers = await User.countDocuments({
    role: "user",
    status: "blocked",
  });
  const totalPendingUsers = await User.countDocuments({
    role: "user",
    status: "pending",
  });

  return res.status(200).json({
    totalUsers,
    totalActiveUsers,
    totalBlockedUsers,
    totalPendingUsers,
  });
});

export {
  inviteUser,
  loginUser,
  updateUser,
  logoutUser,
  reCreateAccessToken,
  getCurrentUser,
  blockUser,
  unblockUser,
  getAllUsers,
  deleteUser,
  userStats,
};
