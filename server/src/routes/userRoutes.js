import express from "express";
import { refreshAccessToken } from "../controllers/userController.js";
const router = express.Router();

router.route("/refresh-token").post(refreshAccessToken);

export default router;
