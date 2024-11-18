import express from "express";
import {
  createBooking,
  getAllBookings,
  verifyPayment,
} from "../controllers/booking/bookingController.js";

const router = express.Router();

router.route("/").post(createBooking).get(getAllBookings);
router.route("/verify").get(verifyPayment);

export default router;
