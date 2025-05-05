import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // For direct messages, you can keep this as 'receiverId'.
      required: true,
    },
    chatRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom", // For group chats or channel-based messaging.
    },
    text: {
      type: String,
    },
    image: {
      type: String, // URL to image
    },
    file: {
      type: String, // URL for file attachments (optional)
    },
    messageType: {
      type: String,
      enum: ["text", "image", "video", "file"], // Allows other media types.
      default: "text",
    },
    isSeen: {
      type: Boolean,
      default: false,
    },
    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // To track who saw the message.
      },
    ],
    repliedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message", // Reference to another message for replies.
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
