import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  vehicleName: {
    type: String,
    required: true,
  },
  vehicleType: {
    type: String,
    enum: [
      "Car",
      "Bus",
      "Van",
      "Bike",
      "Truck",
      "SUV",
      "Mini Bus",
      "Limousine",
      "Sedans",
    ],
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
  photos: {
    type: [String], // Array of photo URLs
    required: false,
  },
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
  //   provider: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "ServiceProvider",
  //     required: true,
  //   },
}, {timestamps: true});

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;
