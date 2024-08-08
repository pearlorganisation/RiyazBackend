import User from "../../models/user.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { COOKIE_OPTIONS } from "../../../constants.js";
import ApiErrorResponse from "../../utils/ApiErrorResponse.js";
import { sendMail } from "../../utils/sendMail.js";

export const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const clientRefreshToken = req.cookies.refresh_token;
  if (!clientRefreshToken) {
    return next(new ApiErrorResponse("Unauthorized Request!", 401));
  }

  const decoded = jwt.verify(
    clientRefreshToken,
    process.env.ACCESS_TOKEN_SECRET
  );

  if (!decoded) return next(new ApiErrorResponse("Invalid refresh token", 401));

  const user = await User.findById(decoded._id);

  if (!user || clientRefreshToken !== user.refreshToken)
    return next(new ApiErrorResponse("Refresh token is expired!", 401));

  const refresh_token = user.generateRefreshToken();
  const access_token = user.generateAccessToken();
  await user.save();

  return res
    .status(200)
    .cookie("access_token", access_token, COOKIE_OPTIONS)
    .cookie("refresh_token", refresh_token, COOKIE_OPTIONS)
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

  const resetLink = `http://localhost:3000/api/v1/user/reset-password/${resetToken}`; // later on change to ${process.env.CLIENT_URL}

  sendMail(email, resetLink)
    .then(() => {
      return res.status(200).json({
        success: true,
        message:
          "Mail sent successfully. Please check your email, including the spam or junk folder to reset your password.",
        resetLink,
      });
    })
    .catch(() => {
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
