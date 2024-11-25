import ApiErrorResponse from "../../utils/ApiErrorResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import Review from "../../models/review.js";
import Vehicle from "../../models/vehicle.js";
import { calculateAverageRating } from "../../utils/ratingHelper.js";
import { paginate } from "../../utils/pagination.js";

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

export const getAllReviews = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page || "1"); // Current page
  const limit = parseInt(req.query.limit || "10"); // Limit per page
  const sortByParam = req.query.sortBy || "newest"; // Default: Newest first

  // Set up filter object if needed
  const filter = {};
  if (req.query?.rating) {
    filter.rating = {
      $gte: parseInt(req.query.rating),
    };
  }

  // Determine sorting order based on sortBy using switch case
  let sortBy;
  switch (sortByParam) {
    case "highest":
      sortBy = { rating: -1 }; // Highest rating first
      break;
    case "newest":
      sortBy = { createdAt: -1 }; // Newest first
      break;
    case "oldest":
      sortBy = { createdAt: 1 }; // Oldest first
      break;
    default:
      sortBy = { createdAt: -1 }; // Default: Newest first
      break;
  }

  // Use the pagination utility function
  const { data: reviews, pagination } = await paginate(
    Review, // The model
    page, // Current page
    limit, // Limit per page
    [
      { path: "vehicleId" }, // Populate vehicleId
      { path: "userId", select: "-password -refreshToken" }, // Populate userId with selected fields
    ],
    filter, // Any filtering conditions
    sortBy
  );

  // Check if no reviews are found
  if (!reviews || reviews.length === 0) {
    return next(new ApiErrorResponse("No reviews found", 404));
  }

  // Return paginated response
  return res.status(200).json({
    success: true,
    message: "Reviews fetched successfully",
    data: reviews,
    pagination, // Include pagination metadata
  });
});
