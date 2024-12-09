import Booking from "../../models/booking.js";
import User from "../../models/user.js";
import Vehicle from "../../models/vehicle.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getDashboardData = asyncHandler(async (req, res) => {
  const totalBookings = await Booking.countDocuments({});
  const totalUsers = await User.countDocuments({});
  const totalVehicles = await Vehicle.countDocuments({});
  const recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(5);
  const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);

  res.status(200).json({
    success: true,
    data: {
      totalBookings,
      totalUsers,
      totalVehicles,
      recentBookings,
      recentUsers,
    },
  });
});
