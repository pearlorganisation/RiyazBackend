import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "User id is required"],
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "User id is required"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Rating is required"],
    },
    content: { type: String },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
