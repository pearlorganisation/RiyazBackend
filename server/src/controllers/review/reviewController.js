import ApiErrorResponse from "../../utils/ApiErrorResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import Review from "../../models/review.js";
import Vehicle from "../../models/vehicle.js";
import { calculateAverageRating } from "../../utils/ratingHelper.js";

// Create a Review
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

  // Calculate and update the vehicle's rating
  const { averageRating, numberOfRatings } = await calculateAverageRating(
    vehicleId
  );
  vehicle.ratings.averageRating = averageRating;
  vehicle.ratings.numberOfRatings = numberOfRatings;
  await vehicle.save();

  return res.status(201).json({
    success: true,
    message: "Review created.",
    data: review,
  });
});

// Update a Review by ID
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

  // Calculate and update the vehicle's rating
  const { averageRating, numberOfRatings } = await calculateAverageRating(
    review.vehicleId
  );
  vehicle.ratings.averageRating = averageRating;
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

  const review = await Review.findByIdAndDelete(reviewId);
  if (!review) {
    return next(new ApiErrorResponse("Review not found", 404));
  }

  const vehicle = await Vehicle.findById(review.vehicleId);
  if (!vehicle) {
    return next(new ApiErrorResponse("Vehicle not found", 404));
  }

  // Calculate and update the vehicle's rating
  const { averageRating, numberOfRatings } = await calculateAverageRating(
    review.vehicleId
  );
  vehicle.ratings.averageRating = averageRating;
  vehicle.ratings.numberOfRatings = numberOfRatings;
  await vehicle.save();

  res.status(200).json({
    success: true,
    message: "Review deleted successfully.",
  });
});


// get all reviews for the admin
export const getAllReviews = asyncHandler(async(req,res,next)=>{
  const data = await Review.find().populate("vehicleId").populate({
    path: "userId",
    select: "-password -refreshToken"
  })
  if(!data){
    return next(new ApiErrorResponse("Failed to get the reviews", 404))
  }res.status(200).json({
    success: true,
    message:"Reviews received successfully",
    data:data
  })
})