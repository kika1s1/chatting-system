import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.model.js";

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
                

        return res.status(200).json(newMessage);
        
    } catch (error) {
        console.log(error);
        next(new AppError("Internal server error", 500));
        
    }
}