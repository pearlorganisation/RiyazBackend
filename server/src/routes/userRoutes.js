import express from "express";
import {
  refreshAccessToken,
  changePassword,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updateProfile
} from "../controllers/user/userController.js";
import { verifyToken } from "../middleware/authMidleware.js";
const router = express.Router();

router.route("/refresh-token").post(verifyToken, refreshAccessToken);
router.route("/change-password").post(verifyToken, changePassword);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").post(resetPassword);
router.route("/profile").get(verifyToken, getUserDetails).put(verifyToken, updateProfile);
export default router;
