import express from "express";
import { createReview } from "../controllers/review/reviewController.js";
import { verifyToken } from "../middleware/authMidleware.js";

const router = express.Router();

router.route("/").post(verifyToken, createReview);

export default router;
