import express from "express";
import { createBooking } from "../controllers/booking/bookingController.js";

const router = express.Router();

router.route("/book").post(createBooking);

export default router;