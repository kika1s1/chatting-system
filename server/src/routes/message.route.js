import { Router } from "express";
import protectedRoute from "../middleware/auth.middleware.js";
import { getMessages, sendMessage } from "../controllers/message.controller.js";

const router = Router()
// get all messages between two users
router.get("/:id",protectedRoute, getMessages)

// send message
router.post("/send/:id",protectedRoute, sendMessage)



export default router