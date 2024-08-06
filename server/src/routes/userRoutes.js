import express from "express";
import {
  refreshAccessToken,
  changePassword,
} from "../controllers/user/userController.js";
import { verifyToken } from "../middleware/authMidleware.js";
const router = express.Router();

router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyToken, changePassword);

export default router;
