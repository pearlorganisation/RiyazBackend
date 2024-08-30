import Review from "../../models/review.js";
import Vehicle from "../../models/vehicle.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const submitReview = asyncHandler(async (req, res, next) => {
  const { vehicleId, userId, rating, content } = req.body;

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    return next(new ApiErrorResponse("Vehicle not found", 404));
  }
  const review = new Review({
    vehicleId,
    userId,
    rating,
    content,
  });
  await review.save();

  // Update vehicle's average rating and number of ratings
  const reviews = await Review.find({ vehicleId }); 
  const numberOfRatings = reviews.length;
  const averageRating =
    reviews.reduce((acc, review) => acc + review.rating, 0) / numberOfRatings;

  vehicle.ratings.averageRating = averageRating;
  vehicle.ratings.numberOfRatings = numberOfRatings;
  await vehicle.save();

  res.status(201).json({
    success: true,
    data: review,
  });
});
