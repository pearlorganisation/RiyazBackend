import express from "express";
import { createBooking, verifyPayment } from "../controllers/booking/bookingController.js";

const router = express.Router();

router.route("/book").post(createBooking);
router.route("/verify").get(verifyPayment);

export default router;