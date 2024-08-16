import express from "express";
import {
  signup,
  login,
  logout,
  verifySignupToken,
} from "../controllers/auth/authController.js";
import { verifyToken } from "../middleware/authMidleware.js";
const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(verifyToken, logout);

router.route("/verify-signup/:token").get(verifySignupToken);

export default router;
