import express from "express";
import { verifyToken } from "../middleware/authMidleware.js";
import {
  createVehicle,
  getAllVehicles,
  searchVehicle,
} from "../controllers/vehicle/vehiclecontroller.js";

const router = express.Router();

router.route("/").post(createVehicle).get(getAllVehicles);
router.route("/search").get(searchVehicle);

export default router;
