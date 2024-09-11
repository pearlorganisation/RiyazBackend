import Vehicle from "../../models/vehicle.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import ApiErrorResponse from "../../utils/ApiErrorResponse.js";
import validateMongodbID from "../../utils/validateMongodbID.js";
import Review from "../../models/review.js";

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

// export const rating = asyncHandler(async (req, res) => {
//   const { _id } = req.user;

//   const { star, vehicleId, comment } = req.body;

//   try {
//     const vehicle = await Vehicle.findById(vehicleId);

//     let alreadyRated = vehicle.ratings.find(
//       (userId) => userId.postedBy.toString() === _id.toString()
//     );

//     if (alreadyRated) {
//       const updatedRating = await Vehicle.updateOne(
//         {
//           ratings: { $elemMatch: alreadyRated },
//         },
//         { $set: { "ratings.$.star": star, "ratings.$.comment": comment } },
//         { new: true }
//       );

//       res.status(200).json({ message: "Updated Rating" });
//     } else {
//       const ratedVehicle = await Vehicle.findByIdAndUpdate(
//         vehicleId,
//         {
//           $push: {
//             ratings: {
//               star: star,
//               postedBy: _id,
//               comment: comment,
//             },
//           },
//         },
//         {
//           new: true,
//         }
//       );

//       res
//         .status(200)
//         .json({ message: "Rated the vehicle", data: ratedVehicle });
//     }
//   } catch (error) {
//     throw new Error(error);
//   }
// });
