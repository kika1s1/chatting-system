import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import User from "../models/user.model.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
  },
});

const userSocketMap = {}; // userId: socketId
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", async (socket) => {
  console.log("New client connected", socket.id);
  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log("User connected", userId, socket.id);
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // ✅ Mark user as online in the DB
    try {
      await User.findByIdAndUpdate(userId, {
        isOnline: true,
      });
    } catch (err) {
      console.error("Error setting user online:", err);
    }
  }

  socket.on("typing", ({ receiverId, senderId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { senderId });
    }
  });

  socket.on("stopTyping", ({ receiverId, senderId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", { senderId });
    }
  });

  socket.on("disconnect", async () => {
    console.log("Client disconnected", socket.id);

    // Find userId associated with this socket
    const disconnectedUserId = Object.keys(userSocketMap).find(
      (key) => userSocketMap[key] === socket.id
    );
    if (disconnectedUserId) {
      delete userSocketMap[disconnectedUserId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));

      // ✅ Update lastSeen and set isOnline = false
      try {
        await User.findByIdAndUpdate(disconnectedUserId, {
          isOnline: false,
          lastSeen: new Date(),
        });
        console.log(`Updated lastSeen for ${disconnectedUserId}`);
      } catch (err) {
        console.error("Error updating lastSeen:", err);
      }
    }
  });
});

export { app, server, io };
