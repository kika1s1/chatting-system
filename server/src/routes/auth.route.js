import { Router } from "express";
import loginLimiter from "../lib/rate-limiter.js";
import { login, logout, signup, updateProfile, checkAuth, google, forget, reset } from "../controllers/auth.controller.js";
import protectedRoute from "../middleware/auth.middleware.js";

const router = Router();

router.post("/signup", signup);

router.post("/login",loginLimiter, login);

router.post("/google", google);

router.post("/logout", logout);

router.put("/update-profile", protectedRoute, updateProfile);

router.post("/forget", forget);

router.post("/reset/:token", reset);

router.get("/check", protectedRoute, checkAuth);

export default router;
