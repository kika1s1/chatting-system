// server.js
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import userRoutes from "./routes/user.route.js";

import connectDB from "./config/db.js";

import errorHandler from "./lib/errorHandler.js";

import { server, app, io } from "./lib/socket.js";

dotenv.config();

// ES Modules __dirname / __filename workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// ─── MIDDLEWARE ────────────────────────────────────────────────────────────────
// parse JSON and urlencoded bodies (with size limit for file uploads)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// ─── API ROUTES ────────────────────────────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/users", userRoutes);

// ─── PRODUCTION STATIC SERVE ────────────────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(__dirname, "../../client/dist");

  // Serve all static assets under client/dist
  app.use(express.static(clientBuildPath));

  // Catch‑all to support client‑side routing in your SPA
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

// ─── ERROR HANDLING ────────────────────────────────────────────────────────────
// errorHandler sends proper responses
app.use(errorHandler);


// ─── CONNECT DATABASE & START SERVER ────────────────────────────────────────────
try {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
} catch (err) {
  console.error("❌ MongoDB connection error:", err.message);
  process.exit(1);
}
