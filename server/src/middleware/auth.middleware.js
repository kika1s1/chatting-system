import jwt from "jsonwebtoken";
import AppError from "../lib/AppError.js";
import User from "../models/user.model.js";

const protectedRoute = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return next(new AppError("You are not logged in!", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password -__v");
    if (!user) {
      return next(new AppError("User no longer exists!", 401));
    }

    req.user = user;
    next();
  } catch (error) {
    next(new AppError("Invalid token!", 401));
  }
};

export default protectedRoute;
