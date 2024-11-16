import User from "../../models/user.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { COOKIE_OPTIONS } from "../../../constants.js";
import ApiErrorResponse from "../../utils/ApiErrorResponse.js";
import { sendForgotPasswordMail } from "../../utils/email/emailTemplates.js";
import { z } from "zod";

export const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const clientRefreshToken = req.cookies.refresh_token;
  if (!clientRefreshToken) {
    return next(new ApiErrorResponse("Unauthorized Request", 401));
  }

  const decoded = jwt.verify(
    clientRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  if (!decoded) return next(new ApiErrorResponse("Invalid refresh token", 401));

  const user = await User.findById(decoded._id);

  if (!user || clientRefreshToken !== user.refreshToken)
    return next(new ApiErrorResponse("Refresh token is expired", 401));

  const refresh_token = user.generateRefreshToken();
  const access_token = user.generateAccessToken();

  user.refreshToken = refresh_token;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .cookie("access_token", access_token, {
      ...COOKIE_OPTIONS,
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), //1day set 15min later on
    })
    .cookie("refresh_token", refresh_token, {
      ...COOKIE_OPTIONS,
      expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15day
    })
    .json({ access_token, refresh_token });
});

export const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  const { email } = req.user;
  if (!email) {
    return next(new ApiErrorResponse("Unauthorized User", 401));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ApiErrorResponse("User not found", 401));
  }

  const isPasswordValid = await user.isPasswordCorrect(currentPassword);
  if (!isPasswordValid) {
    return next(new ApiErrorResponse("Wrong password", 400));
  }

  if (newPassword === currentPassword) {
    return next(
      new ApiErrorResponse("New password cannot be same as old", 400)
    );
  }
  if (newPassword !== confirmNewPassword) {
    return next(new ApiErrorResponse("New passwords do not match", 400));
  }

  user.password = newPassword;
  await user.save();
  return res
    .status(200)
    .json({ success: true, message: "Password changed successfully" });
});

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new ApiErrorResponse("Email is required", 400));
  }

  const existingUser = await User.findOne({ email });
  if (!existingUser) return next(new ApiErrorResponse("No user found!!", 400));

  const resetToken = jwt.sign(
    { userId: existingUser._id, email },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "1d",
    }
  );
  await sendForgotPasswordMail(email, resetToken)
    .then(() => {
      return res.status(200).json({
        success: true,
        message:
          "Mail sent successfully. Please check your email, including the spam or junk folder to reset your password.",
      });
    })
    .catch((error) => {
      res.status(400).json({
        success: false,
        message: `Unable to send mail! ${error.message}`,
      });
    });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { newPassword, confirmNewPassword } = req.body;
  const { token } = req.params;
  if (!newPassword || !confirmNewPassword) {
    return next(new ApiErrorResponse("All field are required", 400));
  }
  if (newPassword !== confirmNewPassword) {
    return next(new ApiErrorResponse("New passwords do not match", 400));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  if (!decoded) {
    return next(new ApiErrorResponse("Invalid token", 400));
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    return next(new ApiErrorResponse("User not found", 401));
  }
  user.password = newPassword;
  await user.save();
  return res
    .status(200)
    .json({ success: true, message: "Password reset successfully" });
});

export const getAuthenticatedUser = asyncHandler(async (req, res, next) => {
  const user = req.user;

  return res.status(200).json({
    data: user,
    success: true,
    message: "Fetched Authenticated User Successfully",
  });
});

/** get user by id */

export const getUserDetails = asyncHandler(async (req, res, next) => {
  const user = req.user;

  return res
    .status(200)
    .json({ data: user, success: true, message: "Get Auth User successfully" });
});

/** Update profile */

export const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, email, mobileNumber } = req.body;
  const updateValidationSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    mobileNumber: z
      .string()
      .length(10, "Mobile number must be exactly 10 digits")
      .regex(/^\d{10}$/, "Mobile number must contain only digits"),
  });

  try {
    updateValidationSchema.parse({ name, email, mobileNumber });
  } catch (error) {
    return next(new ApiErrorResponse(error, 400));
  }
  const data = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        name,
        email,
        mobileNumber,
      },
    },
    {
      new: true,
    }
  );

  if (!data) {
    return next(new ApiErrorResponse("Failed to update the user profile", 400));
  }
  res.status(200).json({ success: true, message: data }, 200);
});

export const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find(); // Fetch all users from the database

  if (!users || users.length === 0) {
    // If no users found, return an error response
    return next(new ApiErrorResponse("No users found", 404));
  }

  res.status(200).json({
    success: true,
    message: "All users found successfully",
    data: users,
  });
});
