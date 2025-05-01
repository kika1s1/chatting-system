import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import mongoose from "mongoose";
import AppError from "../lib/AppError.js";
export const getAllUsers = async (req, res, next) => {
    try {
      const myId = new mongoose.Types.ObjectId(req.user._id);
  
      // Step 1: Get users you’ve chatted with + latest message time
      const messagedUsers = await Message.aggregate([
        {
          $match: {
            $or: [{ senderId: myId }, { receiverId: myId }],
          },
        },
        {
          $addFields: {
            otherUserId: {
              $cond: [
                { $eq: ["$senderId", myId] },
                "$receiverId",
                "$senderId",
              ],
            },
          },
        },
        {
          $sort: { createdAt: -1 }, // Latest first
        },
        {
          $group: {
            _id: "$otherUserId",
            latestMessageTime: { $first: "$createdAt" },
          },
        },
      ]);
  
      const messageTimeMap = new Map();
      messagedUsers.forEach((u) => {
        messageTimeMap.set(u._id.toString(), u.latestMessageTime);
      });
  
      // Step 2: Get all users except self
      let allUsers = await User.find({ _id: { $ne: myId } }).select(
        "-password -__v"
      );
  
      // Step 3: Sort - chatted users by latest → earliest, others go to bottom
      allUsers.sort((a, b) => {
        const timeA = messageTimeMap.get(a._id.toString());
        const timeB = messageTimeMap.get(b._id.toString());
  
        if (timeA && timeB) {
          return new Date(timeB) - new Date(timeA); // both chatted: latest first
        } else if (timeA) {
          return -1; // only A chatted: A comes first
        } else if (timeB) {
          return 1; // only B chatted: B comes first
        } else {
          return 0; // neither: keep original
        }
      });
  
      return res.status(200).json(allUsers);
    } catch (error) {
      console.error(error);
      return next(new AppError("Internal server error", 500));
    }
  };
  
  
// export const getAllUsers = async(req, res, next)=>{
//     try {
//         const users = await User.find({ _id: { $ne: req.user._id } }).select("-password -__v")
//         // check if users exists
//         if(!users){
//             return next(new AppError("Users not found", 400))
//         }
//         return res.status(200).json(users);

        
//     } catch (error) {
//         next(new AppError("Internal server error", 500));
        
//     }
// }

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password -__v");
    // check if user exists
    if (!user) {
      return next(new AppError("User not found", 400));
    }
    return res.status(200).json(user);
  } catch (error) {
    next(new AppError("Internal server error", 500));
  }
}