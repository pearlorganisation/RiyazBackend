import express from "express";
// import { verifyToken } from "../middleware/authMidleware.js";
import { upload } from "../middleware/multer.js";
import {
  createVehicle,
  getAllReviews,
  getAllVehicles,
  getSingleVehicle,
} from "../controllers/vehicle/vehicleController.js";

const router = express.Router();

router
  .route("/")
  .post(upload.array("images", 5), createVehicle)
  .get(getAllVehicles);

router.route("/:id").get(getSingleVehicle);
router.route("/:id/reviews").get(getAllReviews);

export default router;
