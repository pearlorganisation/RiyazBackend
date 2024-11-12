import { asyncHandler } from "../../utils/asyncHandler.js";
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_API_SECRET);

export const createBooking = asyncHandler(async(req,res,next)=>{
   const {amount} = req.body;
   try {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency:"usd"
    });
    res.json({ clientSecret: paymentIntent.client_secret})
   } catch (error) {
    res.status(500).json({error: error.message})
   }
})