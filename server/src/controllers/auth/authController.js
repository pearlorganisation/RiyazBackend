import User from "../../models/user.js";
import { COOKIE_OPTIONS } from "../../../constants.js";
import ApiErrorResponse from "../../utils/ApiErrorResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { generateSignupToken } from "../../utils/tokenHelper.js";
import { sendSignupMail } from "../../utils/email/emailTemplates.js";

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
  const verificationToken = generateSignupToken({
    name,
    email,
    password,
    mobileNumber,
  });
  await sendSignupMail(email, verificationToken)
    .then(() => {
      return res.status(200).json({
        success: true,
        message:
          "Mail sent successfully. Please check your email, including the spam or junk folder to verify your account",
      });
    })
    .catch((error) => {
      res.status(400).json({
        success: false,
        message: `Unable to send mail: ${error.message}`,
      });
    });
});

//VERIFY SIGNUP token controller
// export const verifySignupToken = asyncHandler(async (req, res, next) => {
//   const { token } = req.params;
//   if (!token) {
//     return next(new ApiErrorResponse("Token is not provided", 400));
//   }
//   const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
//   if (!decoded) {
//     return next(
//       new ApiErrorResponse("Email is not verified or Invalid token", 400)
//     );
//   }
//   const user = User.create(decoded);
//   return res
//     .status(201)
//     .json({ success: true, message: "Email verified successfully" });
// });

export const verifySignupToken = asyncHandler(async (req, res, next) => {
  const {
    token
  } = req.params;

  if (!token) {
    return next(new ApiErrorResponse("Token is not provided", 400));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  if (!decoded) {
    return next(
      new ApiErrorResponse("Email is not verified or Invalid token", 400)
    );
  }

  // Create the user
  const user = await User.create(decoded);

  // Generate access and refresh tokens
  const access_token = user.generateAccessToken();
  const refresh_token = user.generateRefreshToken();

  // Set the refresh token in the user document
  user.refreshToken = refresh_token;
  await user.save({
    validateBeforeSave: false
  });

  // Set tokens as cookies
  res
    .cookie("access_token", access_token, {
      ...COOKIE_OPTIONS,
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
    })
    .cookie("refresh_token", refresh_token, {
      ...COOKIE_OPTIONS,
      expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
    });

  // Redirect to the frontend main page for testing right now
  return res.redirect(`${process.env.FRONTEND_MAIN_PAGE_URL}`);
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
  console.log("token: ", access_token);
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
