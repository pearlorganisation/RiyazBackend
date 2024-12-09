import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    vehicleName: {
      type: String,
      required: true,
      unique: true,
    },
    serviceType: {
      type: String,
      enum: ["Shared", "Private", "Rideshare"],
    },
    vehicleType: {
      type: String,
      enum: ["Van", "Bus", "SUV", "Limousine", "Sedan"],
      required: true,
    },
    vehicleClass: {
      type: String,
      enum: ["Economy", "Business", "Luxury"],
      required: true,
    },
    passengerCapacity: {
      type: Number,
      required: true,
    },
    luggageCapacity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    images: [
      {
        asset_id: { type: String, required: true },
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    ratings: {
      averageRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      numberOfRatings: {
        type: Number,
        default: 0,
      },
    },
    pickupLocation: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    pickupDate: {
      type: Date,
      // required: true,
    },
    pickupTime: {
      type: String,
      // required: true,
    },
  },
  { timestamps: true }
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;
