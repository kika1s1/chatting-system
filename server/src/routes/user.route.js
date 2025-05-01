import { Router } from "express";
import protectedRoute from "../middleware/auth.middleware.js";
import { getAllUsers, getUser } from "../controllers/user.controller.js";

const router = Router()
// get all user
router.get("/", protectedRoute, getAllUsers)

// get user by id
router.get("/:id", protectedRoute, getUser)

export default router