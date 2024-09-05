import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    vehicleName: {
      type: String,
      required: true,
      unique: true,
    },
    vehicleType: {
      type: String,
      enum: ["Van", "Bus", "SUV", "Mini Bus", "Limousine", "Sedan"],
      required: true,
    },
    passengersCapacity: {
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
    photos: {
      type: [String], // Array of photo URLs
      required: false,
    },
    // ratings: {
    //   averageRating: {
    //     type: Number,
    //     min: 0,
    //     max: 5,
    //     default: 0,
    //   },
    //   numberOfRatings: {
    //     type: Number,
    //     default: 0,
    //   },
    // },
    ratings: [
      {
        star: Number,
        comment: String,
        postedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    totalRatings: {
      type: String,
      default: 0,
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
      required: true,
    },
    pickupTime: {
      type: String,
      required: true,
    },
    // reviews: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Review",
    //   },
    // ],
    //   provider: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "ServiceProvider",
    //     required: true,
    //   },
  },
  { timestamps: true }
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;
