import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
  },
});



// user socketmap to store user socket ids
const userSocketMap = {}; // userId: socketId
export function getReceiverSocketId(userId) {
  return userSocketMap[userId]; // get the socket id for the user
}
// connect to socket.io
io.on("connection", (socket)=>{
    console.log("New client connected", socket.id);
    const userId = socket.handshake.query.userId;
    if (userId){
        userSocketMap[userId] = socket.id; // store the socket id for the user
        console.log("User connected", userId, socket.id);
        io.emit("getOnlineUsers", Object.keys(userSocketMap)); // emit event to all clients
    }
    // ✅ Typing event
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
    // disconnect event
    socket.on("disconnect", () => {
        console.log("Client disconnected", socket.id);
        delete userSocketMap[userId]; // remove the socket id for the user
        io.emit("getOnlineUsers", Object.keys(userSocketMap)); // emit event to all clients
    });
})
export { app, server, io };
