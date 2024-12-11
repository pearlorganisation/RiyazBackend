import express from "express";
import {
  getDashboardData,
  getUserGrowth,
} from "../controllers/dashboard/dashboardController.js";

const router = express.Router();

router.route("/").get(getDashboardData);
router.route("/growth").get(getUserGrowth);

export default router;
