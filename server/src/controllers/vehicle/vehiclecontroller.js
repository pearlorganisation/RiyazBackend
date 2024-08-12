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
  return res.status(200).json({ success: true, message: "Vehicles retrieved successfully", data: vehicles});
});
