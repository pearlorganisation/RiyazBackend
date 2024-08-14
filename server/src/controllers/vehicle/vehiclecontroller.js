import Vehicle from "../../models/vehicle.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import ApiErrorResponse from "../../utils/ApiErrorResponse.js";

export const createVehicle = asyncHandler(async (req, res, next) => {
  const vehicle = new Vehicle(req.body);
  if (!vehicle) {
    return next(new ApiErrorResponse("Vehicle not created", 400));
  }
  await vehicle.save();
  return res
    .status(201)
    .json({ success: true, message: "Vehicle created", data: vehicle });
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
  const queryObj = {
    pickupLocation: req.query.pickupLocation,
    destination: req.query.destination,
    pickupDate: req.query.pickupDate,
    pickupTime: req.query.pickupTime,
  };

  console.log("-- ", req.query.sortBy);
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

  console.log(sortOption, "Sorting queryyy");
  const vehicles = await Vehicle.find(queryObj).sort(sortOption);
  console.log(vehicles);
  if (!vehicles) {
    return next(
      new ApiErrorResponse("No vehicles found for the given criteria", 404)
    );
  }

  return res.status(200).json({
    success: true,
    message: "Vehicles retrieved successfully",
    data: vehicles,
  });
});
