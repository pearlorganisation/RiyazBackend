import express from "express";
import { submitReview } from "../controllers/review/reviewController.js";
import { verifyToken } from "../middleware/authMidleware.js";

const router = express.Router();

router.route("/").post(verifyToken, submitReview);

export default router;
