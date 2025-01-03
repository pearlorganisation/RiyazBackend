import { asyncHandler } from "../../utils/asyncHandler.js";
import Stripe from "stripe";
import dotenv from "dotenv";
import Booking from "../../models/booking.js";
import { nanoid } from "nanoid";
import { paginate } from "../../utils/pagination.js";
import ApiErrorResponse from "../../utils/ApiErrorResponse.js";
dotenv.config();

const stripe = new Stripe(`${process.env.STRIPE_API_SECRET}`);

export const createBooking = asyncHandler(async (req, res, next) => {
  const { products, price, numPeople, userInfo } = req.body;
  console.log("user info", userInfo);

  const booking = await Booking.create({
    bookingId: `BID_${nanoid(8)}${Date.now()}`,
    user: userInfo?._id,
    vehicle: products?._id,
    bookingDate: products.pickupDate,
    totalPrice: price,
    bookingStatus: "pending",
    paymentStatus: "unpaid",
  });

  console.log(products, "amount received");
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd", // or the relevant currency
          product_data: {
            name: products.vehicleName ?? "Book Ride",
            images: products.images[0].success_url,
          },
          unit_amount: Math.round(price * 100), // Stripe expects amount in cents
        },
        quantity: numPeople,
      },
    ],
    mode: "payment",
    success_url: `http://localhost:5173/booking/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking._id}`,
    cancel_url: "http://localhost:5173/booking/cancel",
  });

  // update the booking with session id
  await Booking.findByIdAndUpdate(booking._id, {
    stripeSessionId: session.id,
  });

  res.json({
    id: session.id,
  });
});

/*------------------------------verify payment-----------------------*/
export const verifyPayment = asyncHandler(async (req, res) => {
  const { sessionId, bookingId } = req.query;

  // console.log("the sessionid------", sessionId)
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status === "paid") {
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        $set: {
          paymentStatus: "paid",
          bookingStatus: "confirmed",
          // updatedAt: new Date()
        },
      },
      {
        new: true,
      }
    );
    res.json({
      success: true,
      message: "payment successful",
      booking,
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Payment Failed",
    });
  }
});

export const getAllBookings = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page || "1");
  const limit = parseInt(req.query.limit || "10");
  const { bookingStatus, paymentStatus } = req.query;

  const sortBy = {}; // Sorting options - can make helper
  switch (req.query.sortBy) {
    case "price-asc": // Price (Low to High)
      sortBy.totalPrice = 1;
      break;
    case "price-desc": // Price (High to Low)
      sortBy.totalPrice = -1;
      break;
    case "date-asc": // Date (Old to New)
      sortBy.createdAt = 1;
      break;
    case "date-desc": // Date (New to Old)
      sortBy.createdAt = -1;
      break;
  }
  // Helper function to handle multiple selection
  const handleMultiSelect = (value) =>
    value ? { $in: value.split(",") } : undefined;

  // can make helper function to make filter
  const filter = {
    ...(bookingStatus && { bookingStatus: handleMultiSelect(bookingStatus) }), // More filter need to be addded
    ...(paymentStatus && { paymentStatus: handleMultiSelect(paymentStatus) }),
  };
  // Use the pagination utility function
  const { data: bookings, pagination } = await paginate(
    Booking, // The model
    page, // Current page
    limit, // Limit per page
    [{ path: "user", select: "name mobileNumber" }, { path: "vehicle" }], // 🔴Need to reduce data for listin bookings only show requied data
    filter, // Any filtering conditions
    sortBy
  );

  // Check if no bookings are found
  if (!bookings || bookings.length === 0) {
    return next(new ApiErrorResponse("No bookings found", 404));
  }

  // Return paginated response with ApiResponse
  return res.status(200).json({
    success: true,
    message: "Bookings fetched successfully",
    pagination,
    data: bookings,
  });
});
