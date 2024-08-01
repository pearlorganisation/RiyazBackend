import User from "../models/user";
import ApiErrorResponse from "../utils/ApiErrorResponse";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler";

export const verifyToken = asyncHandler(async (req, res, next) => {
  const { access_token } = req.cookies;
  if (!access_token) {
    return next(new ApiErrorResponse("Unauthorized user!", 401));
  }
  const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET);
  if (!decoded) {
    return next(new ApiErrorResponse("Invalid access token!", 401));
  }
  const user = await User.findById(decoded._id).select(
    "-password -refreshToken"
  );
  if (!user) {
    return next(new ApiErrorResponse("Invalid access token!", 401));
  }
  req.user = user;
  next();
});
