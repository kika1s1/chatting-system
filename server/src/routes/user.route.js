import { Router } from "express";
import protectedRoute from "../middleware/auth.middleware.js";
import { getAllUsers } from "../controllers/user.controller.js";

const router = Router()
// get all user
router.get("/", protectedRoute, getAllUsers)

export default router