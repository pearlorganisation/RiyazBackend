import express from "express";
import {
  createReview,
  deleteReviewById,
  updateReviewById,
} from "../controllers/review/reviewController.js";
import { verifyToken } from "../middleware/authMidleware.js";

const router = express.Router();

router.route("/").post(verifyToken, createReview);
router.route("/:reviewId").put(updateReviewById).delete(deleteReviewById);

export default router;
