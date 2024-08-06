import express from "express";
import { signup, login, logout } from "../controllers/auth/authController.js";
import { verifyToken } from "../middleware/authMidleware.js";
const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(verifyToken, logout);

export default router;
