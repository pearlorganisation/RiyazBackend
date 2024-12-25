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
    { name: "daily", duration: "day" },
    { name: "weekly", duration: "week" },
    { name: "quarterly", duration: "quarter" },
  ];

  const results = [];

  for (const period of periods) {
    let currentPeriodStart, // Start of the current period
      currentPeriodEnd,
      previousPeriodStart, // Start of the previous period
      previousPeriodEnd;

    if (period.name === "daily") {
      currentPeriodStart = moment().startOf("day").toDate(); // 2024-12-25 00:00:00
      previousPeriodStart = moment().subtract(1, "day").startOf("day").toDate(); // 2024-12-24 00:00:00
      previousPeriodEnd = moment().subtract(1, "day").endOf("day").toDate(); // 2024-12-24 23:59:59
    } else if (period.name === "weekly") {
      currentPeriodStart = moment().startOf("week").toDate(); //2024-12-23 00:00:00
      previousPeriodStart = moment() //2024-12-16 00:00:00
        .subtract(1, "week")
        .startOf("week")
        .toDate();
      previousPeriodEnd = moment().subtract(1, "week").endOf("week").toDate(); //2024-12-22 23:59:59
    } else if (period.name === "quarterly") {
      currentPeriodStart = moment().startOf("quarter").toDate(); //2024-10-01 00:00:00
      previousPeriodStart = moment() //2024-07-01 00:00:00
        .subtract(1, "quarter")
        .startOf("quarter")
        .toDate();
      previousPeriodEnd = moment() //2024-09-30 23:59:59
        .subtract(1, "quarter")
        .endOf("quarter")
        .toDate();
    }

    const currentPeriodUsers = await User.countDocuments({
      createdAt: {
        $gte: currentPeriodStart,
        $lte: currentPeriodEnd || currentPeriodStart,
      },
    });
    const previousPeriodUsers = await User.countDocuments({
      createdAt: { $gte: previousPeriodStart, $lte: previousPeriodEnd },
    });

    let growthPercentage = 0;
    if (previousPeriodUsers > 0) {
      growthPercentage =
        ((currentPeriodUsers - previousPeriodUsers) / previousPeriodUsers) *
        100;
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
