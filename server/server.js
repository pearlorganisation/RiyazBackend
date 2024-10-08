import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import morgan from "morgan";
import { connectToMongoDB } from "./src/configs/db/connectToMongoDB.js";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import vehicleRoutes from "./src/routes/vehicleRoutes.js";
import reviewRoutes from "./src/routes/reviewRoutes.js";
import { error } from "./src/middleware/error.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 8000;

app.use(express.json({ extended: false }));
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], // Allow requests from this origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed methods
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Routes Declaration
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/vehicles", vehicleRoutes);
app.use("/api/v1/reviews", reviewRoutes);

app.use(error);

connectToMongoDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => console.log(`MongoDB Connection Failed!! ${error}`));
