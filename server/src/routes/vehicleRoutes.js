import express from "express";
import { verifyToken } from "../middleware/authMidleware.js";
import {
  createVehicle,
  getAllVehicles,
} from "../controllers/vehicle/vehiclecontroller.js";
const router = express.Router();

router.route("/").post(createVehicle).get(getAllVehicles);

export default router;
