import Booking from "../../models/booking.js";
import User from "../../models/user.js";
import Vehicle from "../../models/vehicle.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import moment from "moment";

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

// export const getUserGrowth = asyncHandler(async (req, res) => {
//   const currentMonthStart = moment().startOf("month").toDate();
//   const previousMonthStart = moment()
//     .subtract(1, "month")
//     .startOf("month")
//     .toDate();
//   const previousMonthEnd = moment()
//     .subtract(1, "month")
//     .endOf("month")
//     .toDate();

//   // Count users for current and previous periods
//   const currentPeriodUsers = await User.countDocuments({
//     createdAt: { $gte: currentMonthStart },
//   });
//   const previousPeriodUsers = await User.countDocuments({
//     createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd },
//   });

//   // Calculate growth percentage
//   let growthPercentage = 0;
//   if (previousPeriodUsers > 0) {
//     growthPercentage =
//       ((currentPeriodUsers - previousPeriodUsers) / previousPeriodUsers) * 100;
//   } else if (currentPeriodUsers > 0) {
//     growthPercentage = 100; // 100% growth if there were no users in the previous period.
//   }

//   res.status(200).json({
//     success: true,
//     data: {
//       currentPeriodUsers,
//       previousPeriodUsers,
//       growthPercentage: growthPercentage.toFixed(2),
//     },
//   });
// });

export const getUserGrowth = asyncHandler(async (req, res) => {
  const periods = [
    { name: 'daily', duration: 'day' },
    { name: 'weekly', duration: 'week' },
    { name: 'quarterly', duration: 'quarter' },
  ];

  const results = [];

  for (const period of periods) {
    let currentPeriodStart, currentPeriodEnd, previousPeriodStart, previousPeriodEnd;

    if (period.name === 'daily') {
      currentPeriodStart = moment().startOf('day').toDate();
      previousPeriodStart = moment().subtract(1, 'day').startOf('day').toDate();
      previousPeriodEnd = moment().subtract(1, 'day').endOf('day').toDate();
    } else if (period.name === 'weekly') {
      currentPeriodStart = moment().startOf('week').toDate();
      previousPeriodStart = moment().subtract(1, 'week').startOf('week').toDate();
      previousPeriodEnd = moment().subtract(1, 'week').endOf('week').toDate();
    } else if (period.name === 'quarterly') {
      currentPeriodStart = moment().startOf('quarter').toDate();
      previousPeriodStart = moment().subtract(1, 'quarter').startOf('quarter').toDate();
      previousPeriodEnd = moment().subtract(1, 'quarter').endOf('quarter').toDate();
    }

    const currentPeriodUsers = await User.countDocuments({
      createdAt: { $gte: currentPeriodStart, $lte: currentPeriodEnd || currentPeriodStart },
    });
    const previousPeriodUsers = await User.countDocuments({
      createdAt: { $gte: previousPeriodStart, $lte: previousPeriodEnd },
    });

    let growthPercentage = 0;
    if (previousPeriodUsers > 0) {
      growthPercentage =
        ((currentPeriodUsers - previousPeriodUsers) / previousPeriodUsers) * 100;
    } else if (currentPeriodUsers > 0) {
      growthPercentage = 100; // 100% growth if there were no users in the previous period.
    }

    results.push({
      period: period.name,
      currentPeriodUsers,
      previousPeriodUsers,
      growthPercentage: growthPercentage.toFixed(2),
    });
  }

  res.status(200).json({
    success: true,
    data: results,
  });
});
