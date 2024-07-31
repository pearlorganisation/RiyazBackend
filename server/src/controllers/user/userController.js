import User from "../../models/user.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { COOKIE_OPTIONS } from "../../../constants.js";
import ApiErrorResponse from "../../utils/ApiErrorResponse.js";

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
