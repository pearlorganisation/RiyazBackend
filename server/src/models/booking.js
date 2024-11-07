import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  bookingDate: {
    type: Date,
    default: Date.now(),
    required: true,
  },
  bookingStatus: {
    type: String,
    enum: ["Pending", "Confirmed", "Cancelled"],
    default: "Pending",
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["Paid", "Unpaid"],
    default: "Unpaid",
    required: true,
  },
});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
