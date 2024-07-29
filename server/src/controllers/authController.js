import User from "../models/user.js";
import { COOKIE_OPTIONS } from "../../constants.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const signup = asyncHandler(async (req, res, next) => {
  const { name, email, password, mobileNumber } = req.body;
  if (!name || !email || !password || !mobileNumber) {
    return next(new ApiError("All fields are required", 400));
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError("User already exits!", 400));
  }
  const newUser = User.create({
    name,
    email,
    password,
    mobileNumber,
  });
  res
    .status(201)
    .json({ success: true, message: "User register successfully." });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req?.body;
  const existingUser = await User.findOne({ email });

  if (!existingUser) return next(new ErrorResponse("No user found!", 400));

  const isValidPassword = existingUser.isPasswordCorrect(password);

  if (!isValidPassword) return next(new ErrorResponse("Wrong password!!", 400));

  const refresh_token = existingUser.generateRefreshToken();
  const access_token = existingUser.generateAccessToken();
  res
    .cookie("access_token", refresh_token, COOKIE_OPTIONS)
    .cookie("refresh_token", access_token, COOKIE_OPTIONS)
    .status(200)
    .json({ success: true, message: "Logged in successfully." });
});

export const logout = async (req, res) => {};
