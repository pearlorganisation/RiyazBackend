import express from "express";
// import { verifyToken } from "../middleware/authMidleware.js";
import { upload } from "../middleware/multer.js";
import {
  createVehicle,
  deleteVehicleById,
  getAllReviews,
  getAllVehicles,
  getSingleVehicle,
  updateVehicleById,
} from "../controllers/vehicle/vehicleController.js";
import fileParser from "../utils/fileParser.js";

const router = express.Router();

router
  .route("/")
  .post(upload.array("images", 5), createVehicle)
  .get(getAllVehicles); //searching, filtering, and sorting also implemented

router.route("/:id").patch(upload.array("images",5),updateVehicleById).get(getSingleVehicle).delete(deleteVehicleById);
router.route("/:id/reviews").get(getAllReviews);

export default router;
