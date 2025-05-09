import { StreamChat } from "stream-chat";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  throw new Error("Missing Stream API credentials in environment variables.");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
  try {
    await streamClient.upsertUser(userData);
    return userData;
  } catch (error) {
    console.error("Error upserting Stream user:", error);
    throw error;
  }
};
export const generateStreamToken = (userId) => {
  try {
    const userIdString  = userId.toString();
    const token = streamClient.createToken(userIdString);
    return token;
  } catch (error) {
    console.error("Error generating Stream token:", error);
    throw error;
  }
}