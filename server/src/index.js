import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js"
import userRoutes from "./routes/user.route.js"

import connectDB from "./config/db.js";

import errorHandler from "./lib/errorHandler.js";
import AppError from "./lib/AppError.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
// limit the size of the request body to 50mb
// this is to allow large file uploads
app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));


// auth routes 
app.use("/api/v1/auth", authRoutes);
// message routes
app.use("/api/v1/messages", messageRoutes);

// user routes 
app.use("/api/v1/users", userRoutes)



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