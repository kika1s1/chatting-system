import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.route.js";

import connectDB from "./config/db.js";

import errorHandler from "./lib/errorHandler.js";
import AppError from "./lib/AppError.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// auth routes 
app.use("/api/v1/auth", authRoutes);



// error handling middleware
app.use(AppError);
app.use(errorHandler);

// connect to db and start server
try {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  
} catch (error) {
  console.error("MongoDB connection error:", error.message);
  process.exit(1);
  
}