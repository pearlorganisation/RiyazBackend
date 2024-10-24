import Vehicle from "../../models/vehicle.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import ApiErrorResponse from "../../utils/ApiErrorResponse.js";
import validateMongodbID from "../../utils/validateMongodbID.js";
import Review from "../../models/review.js";
import { uploadFileToCloudinary } from "../../configs/cloudinary/cloudinary.js";

export const createVehicle = asyncHandler(async (req, res, next) => {
  const images = req.files;
  const response = await uploadFileToCloudinary(images);
  const vehicle = await Vehicle.create({
    ...req.body,
    ratings: req.body.ratings ? JSON.parse(req.body.ratings) : null,
    images: response,
  });
  if (!vehicle) {
    return next(new ApiErrorResponse("Vehicle not created", 400));
  }
  return res
    .status(201)
    .json({ success: true, message: "Vehicle is created", data: vehicle });
});

export const getSingleVehicle = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  validateMongodbID(id);

  const vehicle = await Vehicle.findById(id);
  if (!vehicle) {
    return next(new ApiErrorResponse("Vehicle not found", 404));
  }
  return res.status(200).json({
    success: true,
    message: "Vehicle with given ID retrieved successfully",
    data: vehicle,
  });
});

export const getAllVehicles = asyncHandler(async (req, res, next) => {
  const vehicles = await Vehicle.find();
  if (!vehicles) {
    return next(new ApiErrorResponse("Vehicle not found", 404));
  }
  return res.status(200).json({
    success: true,
    message: "Vehicles retrieved successfully",
    data: vehicles,
  });
});

export const searchVehicle = asyncHandler(async (req, res, next) => {
  //console.log(req.query); //{} when no query send
  // Construct search query based on user input
  const queryObj = constructVehicleSearchQuery(req.query);

  // console.log("fdsjk", queryObj);
  // console.log("-- ", req.query.sortBy);
  const sortOption = {};
  switch (req.query.sortBy) {
    case "price-asc":
      sortOption.price = 1;
      break;
    case "price-desc":
      sortOption.price = -1;
      break;
    case "rating-asc":
      sortOption["ratings.averageRating"] = 1;
      break;
    case "rating-desc":
      sortOption["ratings.averageRating"] = -1;
      break;
  }

  // console.log(sortOption, "Sorting queryyy");

  // Pagination setup
  const pageSize = parseInt(req.query.limit || "5");
  const pageNumber = parseInt(req.query.page || "1");
  const skip = (pageNumber - 1) * pageSize;

  // Fetch vehicles based on constructed query and sorting options
  const vehicles = await Vehicle.find(queryObj)
    .sort(sortOption)
    .skip(skip)
    .limit(pageSize);

  // If no vehicles are found, send an error response
  if (!vehicles || vehicles.length === 0) {
    return next(
      new ApiErrorResponse("No vehicles found for the given criteria", 404)
    );
  }

  // Total count for pagination
  const total = await Vehicle.countDocuments(queryObj);

  // Response with pagination info
  return res.status(200).json({
    success: true,
    message: "Vehicles retrieved successfully",
    pagination: {
      total,
      page: pageNumber,
      pageSize,
      pages: Math.ceil(total / pageSize),
    },
    data: vehicles,
  });
});

export const getAllReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ vehicleId: req.params.id });
  if (!reviews || reviews.length === 0) {
    return next(new ApiErrorResponse("No reviews found for this vehicle", 404));
  }
  return res.status(200).json({
    success: true,
    message: "Reviews retrieved successfully",
    data: reviews,
  });
});

// Helper function to construct search query based on request parameters
const constructVehicleSearchQuery = (queryParams) => {
  let constructedQuery = {};

  if (queryParams.pickupLocation) {
    constructedQuery.pickupLocation = new RegExp(
      queryParams.pickupLocation,
      "i"
    );
  }

  if (queryParams.destination) {
    constructedQuery.destination = new RegExp(queryParams.destination, "i");
  }

  if (queryParams.pickupDate) {
    constructedQuery.pickupDate = queryParams.pickupDate;
  }

  if (queryParams.pickupTime) {
    constructedQuery.pickupTime = queryParams.pickupTime;
  }

  if (queryParams.serviceType) {
    constructedQuery.serviceType = {
      $in: Array.isArray(queryParams.serviceType) // $in: queryParams.serviceType.split(",") -> ?serviceType=Shared,Private ->serviceType = "Shared,Private"
        ? queryParams.serviceType
        : [queryParams.serviceType],
    };
  }

  if (queryParams.vehicleType) {
    constructedQuery.vehicleType = {
      $in: Array.isArray(queryParams.vehicleType)
        ? queryParams.vehicleType
        : [queryParams.vehicleType],
    };
  }

  if (queryParams.vehicleClass) {
    constructedQuery.vehicleClass = {
      $in: Array.isArray(queryParams.vehicleClass)
        ? queryParams.vehicleClass
        : [queryParams.vehicleClass],
    };
  }

  if (queryParams.rating) {
    constructedQuery["ratings.averageRating"] = {
      $gte: parseInt(queryParams.rating),
    };
  }

  if (queryParams.reviews) {
    constructedQuery["ratings.numberOfRatings"] = {
      $gte: parseInt(queryParams.reviews),
    };
  }

  return constructedQuery;
};
