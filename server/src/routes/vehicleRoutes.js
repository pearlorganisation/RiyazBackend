import express from "express";
import { verifyToken } from "../middleware/authMidleware.js";
import {
  createVehicle,
  getAllVehicles,
  getSingleVehicle,
  rating,
  searchVehicle,
} from "../controllers/vehicle/vehicleController.js";

const router = express.Router();

router.route("/").post(createVehicle).get(getAllVehicles);
router.route("/:id").get(getSingleVehicle);
router.route("/search").get(searchVehicle);
// router.route("/:id/reviews",  getAllReviews);
// router.route("/rating").post(verifyToken, rating);

export default router;
