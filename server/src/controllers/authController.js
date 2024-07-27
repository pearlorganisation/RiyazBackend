import User from "../models/user.js";
import { COOKIE_OPTIONS } from "../../constants.js";

export const signup = async (req, res) => {};

export const login = async (req, res) => {
  const { email, password } = req?.body;
  const existingUser = await User.findOne({ email });

  if (!existingUser) return next(new ErrorResponse("No user found!!", 400));

  const isValidPassword = existingUser.isPasswordCorrect(password);

  if (!isValidPassword) return next(new ErrorResponse("Wrong password!!", 400));
  res
    .cookie("access-token", accessToken, COOKIE_OPTIONS) 
    .cookie("refresh-token", refreshToken, COOKIE_OPTIONS)
    .status(200)
    .json({ success: true, message: "Logged in successfully!!" });
};

export const logout = async (req, res) => {};
