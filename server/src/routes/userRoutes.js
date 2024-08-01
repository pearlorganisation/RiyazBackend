import express from "express";
import { refreshAccessToken } from "../controllers/user/userController.js";
const router = express.Router();

router.route("/refresh-token").post(refreshAccessToken);
// router.route("/change-password").post(changePassword)

export default router;
