import express from "express";
import {
  createReview,
  deleteReviewById,
  getAllReviews,
  updateReviewById,
} from "../controllers/review/reviewController.js";
import { verifyToken } from "../middleware/authMidleware.js";

const router = express.Router();

router.route("/").post(verifyToken, createReview);
router.route("/:reviewId").put(updateReviewById).delete(deleteReviewById);

/*----------------------------------To get all the reviews for the admin-----------------------------------------------*/
router.route("/allreviews").get(getAllReviews);
export default router;
