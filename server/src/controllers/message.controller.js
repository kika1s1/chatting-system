import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import AppError from "../lib/AppError.js";

export const getMessages = async (req, res, next) => {
    try {
        // user to chat id
        const { id:userToChatId } = req.params;
        // my id is in the token
        const myId =  req.user._id;
        const messages = await Message.find({
            $or:[
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ]
        });
        return res.status(200).json(messages);
    } catch (error) {
        next(new AppError("Internal server error", 500));
        
    }
}
export const sendMessage = async (req, res, next) => {
    try {
        // user to chat id
        const { id:receiverId } = req.params;
        // my id is in the token
        const myId = req.user._id;
        const { text, image } = req.body;
        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }
        // check if message is provided
        const newMessage = new Message({
            senderId: myId,
            receiverId: receiverId,
            text,
            image:imageUrl
        });
        await newMessage.save();
        // todo: real time functionality with socket.io
        const recieverSockerId = getReceiverSocketId(receiverId);
        if (recieverSockerId) {
            io.to(recieverSockerId).emit("newMessage", newMessage); // emit event to the receiver
        }


                

        return res.status(200).json(newMessage);
        
    } catch (error) {
        console.log(error);
        next(new AppError("Internal server error", 500));
        
    }
}

export const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const myId = req.user._id;
    const message = await Message.findById(id);
    if (!message) return next(new AppError("Message not found", 404));
    if (message.senderId.toString() !== myId.toString())
      return next(new AppError("Not authorized", 401));

    // determine other user
    const otherUser =
      message.senderId.toString() === myId.toString()
        ? message.receiverId
        : message.senderId;

    await message.deleteOne();

    // emit real‑time delete
    const sockId = getReceiverSocketId(otherUser.toString());
    if (sockId) io.to(sockId).emit("messageDeleted", { id });

    return res.status(200).json({ message: "Deleted", id });
  } catch (err) {
    next(new AppError("Internal server error", 500));
  }
};

export const updateMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const myId = req.user._id;
    const { text, image } = req.body;

    const message = await Message.findById(id);
    if (!message) return next(new AppError("Message not found", 404));
    if (message.senderId.toString() !== myId.toString())
      return next(new AppError("Not authorized", 401));

    let imageUrl = message.image;
    if (image) {
      const upload = await cloudinary.uploader.upload(image);
      imageUrl = upload.secure_url;
    }

    message.text = text ?? message.text;
    message.image = imageUrl;
    await message.save();

    // determine other user
    const otherUser =
      message.senderId.toString() === myId.toString()
        ? message.receiverId
        : message.senderId;

    // emit real‑time update
    const sockId = getReceiverSocketId(otherUser.toString());
    if (sockId) io.to(sockId).emit("messageUpdated", message);

    return res.status(200).json(message);
  } catch (err) {
    next(new AppError("Internal server error", 500));
  }
};

export const markMessagesAsSeen  = async (req, res, next) => {
    try {
        const { senderId } = req.params;
        const myId = req.user._id;
        const messages = await Message.updateMany(
            { senderId, receiverId: myId },
            { $set: { seen: true } }
        );
        // emit message seen
        const recieverSockerId = getReceiverSocketId(senderId);
        if (recieverSockerId) {
            io.to(recieverSockerId).emit("messagesSeen", {
                senderId,
                receiverId: myId,
            });
        }


        return res.status(200).json(messages);
    } catch (error) {
        next(new AppError("Internal server error", 500));
        
    }
}