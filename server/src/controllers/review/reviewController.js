import Review from "../../models/review.js";
import Vehicle from "../../models/vehicle.js";
import ApiErrorResponse from "../../utils/ApiErrorResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const createReview = asyncHandler(async (req, res, next) => {
  const { vehicleId, rating, content } = req.body;

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    return next(new ApiErrorResponse("Vehicle not found", 404));
  }
  const review = new Review({
    vehicleId,
    userId: req.user?._id,
    rating,
    content,
  });
  await review.save();

  // Update vehicle's average rating and number of ratings
  const reviews = await Review.find({ vehicleId });
  const numberOfRatings = reviews.length;
  const averageRating =
    reviews.reduce((acc, review) => acc + review.rating, 0) / numberOfRatings;

  vehicle.ratings.averageRating = Math.round(averageRating * 10) / 10;
  vehicle.ratings.numberOfRatings = numberOfRatings;
  await vehicle.save();

  return res.status(201).json({
    success: true,
    message: "Review is created.",
    data: review,
  });
});

export const updateReviewById = asyncHandler(async (req, res, next) => {
  const { reviewId } = req.params;
  if (!reviewId) {
    return next(new ApiErrorResponse("Review Id is required", 400));
  }

  const review = await Review.findByIdAndUpdate(reviewId, req.body, {
    new: true,
  });
  if (!review) {
    return next(new ApiErrorResponse("Review not found", 404));
  }
  const vehicle = await Vehicle.findById(review.vehicleId);
  if (!vehicle) {
    return next(new ApiErrorResponse("Vehicle not found", 404));
  }

  // Update vehicle's average rating and number of ratings
  const reviews = await Review.find({ vehicleId: review.vehicleId });
  const numberOfRatings = reviews.length;
  const averageRating =
    reviews.reduce((acc, review) => acc + review.rating, 0) / numberOfRatings;

  vehicle.ratings.averageRating = Math.round(averageRating * 10) / 10; // Rounds to 1 decimal place
  vehicle.ratings.numberOfRatings = numberOfRatings;
  await vehicle.save();

  return res.status(200).json({
    success: true,
    message: "Review updated successfully.",
    data: review,
  });
});

// Delete a Review by ID
export const deleteReviewById = asyncHandler(async (req, res, next) => {
  const { reviewId } = req.params;
  if (!reviewId) {
    return next(new ApiErrorResponse("Review Id is required", 400));
  }

  // Use findByIdAndDelete to find and remove the review in one step
  const review = await Review.findByIdAndDelete(reviewId);
  if (!review) {
    return next(new ApiErrorResponse("Review not found", 404));
  }

  const vehicle = await Vehicle.findById(review.vehicleId);
  if (!vehicle) {
    return next(new ApiErrorResponse("Vehicle not found", 404));
  }

  // Update the vehicle's ratings after deleting the review
  const reviews = await Review.find({ vehicleId: review.vehicleId });
  const numberOfRatings = reviews.length;
  const averageRating = //Edge case: If only one review there for vehicle and we deleted it, then average rating should be 0
    numberOfRatings > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) /
        numberOfRatings
      : 0;

  vehicle.ratings.averageRating = Math.round(averageRating * 10) / 10;
  vehicle.ratings.numberOfRatings = numberOfRatings;
  await vehicle.save();

  res.status(200).json({
    success: true,
    message: "Review deleted successfully.",
  });
});
