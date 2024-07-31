import express from "express";
import { signup, login, logout } from "../controllers/auth/authController.js";

const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);

export default router;
