import { asyncHandler } from "../../utils/asyncHandler.js";
import Stripe from "stripe"
import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(`${process.env.STRIPE_API_SECRET}`);

export const createBooking = asyncHandler(async(req,res,next)=>{
   const {amount} = req.body;
    console.log(amount, "amount received");
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
       line_items: [{
           price_data: {
               currency: "usd", // or the relevant currency
               product_data: {
                   name: "Booking Payment",
               },
               unit_amount: amount * 100, // Stripe expects amount in cents
           },
           quantity: 1,
       }, 
    ],
        mode: "payment",
        success_url: "http://localhost:5173/vehicle-details",
        cancel_url: "http://localhost:5173/vehicles"
    })
    res.json({
        id: session.id
    })
})