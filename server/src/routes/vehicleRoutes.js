import express from "express";
import { verifyToken } from "../middleware/authMidleware.js";
import {
  createVehicle,
  getAllReviews,
  getAllVehicles,
  getSingleVehicle,
  // rating,
  searchVehicle,
} from "../controllers/vehicle/vehicleController.js";

const router = express.Router();

router.route("/").post(createVehicle).get(getAllVehicles);
router.route("/search").get(searchVehicle);
router.route("/:id").get(getSingleVehicle);

//Reviews routes
router.route("/:id/reviews").get(getAllReviews);
// router.route("/rating").post(verifyToken, rating);

export default router;
