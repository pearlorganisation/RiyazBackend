import User from "../../models/user.js";
import { COOKIE_OPTIONS } from "../../../constants.js";
import ApiErrorResponse from "../../utils/ApiErrorResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

//SIGNUP Controller
export const signup = asyncHandler(async (req, res, next) => {
  const { name, email, password, mobileNumber } = req.body;
  if (!name || !email || !password || !mobileNumber) {
    return next(new ApiErrorResponse("All fields are required", 400));
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiErrorResponse("User already exits", 400));
  }
  const newUser = await User.create({
    name,
    email,
    password,
    mobileNumber,
  });
  res
    .status(201)
    .json({ success: true, message: "User register successfully" });
});

//LOGIN Controller
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req?.body;
  if (!email || !password) {
    return next(new ApiErrorResponse("All fields are required", 400));
  }
  const existingUser = await User.findOne({ email });
  if (!existingUser) return next(new ApiErrorResponse("No user found", 400));

  const isValidPassword = await existingUser.isPasswordCorrect(password);

  if (!isValidPassword) {
    return next(new ApiErrorResponse("Wrong password", 400));
  }

  const access_token = existingUser.generateAccessToken();
  const refresh_token = existingUser.generateRefreshToken();

  existingUser.refreshToken = refresh_token;
  await existingUser.save({ validateBeforeSave: false });

  res
    .cookie("access_token", access_token, {
      ...COOKIE_OPTIONS,
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), //1day set 15min later on
    })
    .cookie("refresh_token", refresh_token, {
      ...COOKIE_OPTIONS,
      expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15day
    })
    .status(200)
    .json({ success: true, message: "Logged in successfully" });
});

// LOGOUT Controller
export const logout = async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );
  res
    .cookie("access_token", "", {
      ...COOKIE_OPTIONS,
      expires: new Date(0),
    })
    .cookie("refresh_token", "", {
      ...COOKIE_OPTIONS,
      expires: new Date(0),
    })
    .status(200)
    .json({ success: true, message: "Logged out successfully." });
};
