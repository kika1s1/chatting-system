import jwt from "jsonwebtoken";
const generateToken = (userId, time) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: time, // or '1h', '30m', etc.
      
    });
  };

  export default generateToken;