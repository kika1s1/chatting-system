import { Router } from "express";
import protectedRoute from "../middleware/auth.middleware.js";
import { getMessages, sendMessage, deleteMessage, updateMessage, markMessagesAsSeen} from "../controllers/message.controller.js";

const router = Router()
// get all messages between two users
router.get("/:id",protectedRoute, getMessages)

// send message
router.post("/send/:id",protectedRoute, sendMessage)

// delete message
router.delete("/:id",protectedRoute, deleteMessage)

// update message
router.put("/:id",protectedRoute, updateMessage)

// seen message
router.patch("/seen/:senderId",protectedRoute, markMessagesAsSeen)





export default router