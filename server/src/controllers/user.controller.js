import User from "../models/user.model.js";
import AppError from "../lib/AppError.js";
  
export const getAllUsers = async(req, res, next)=>{
    try {
        const users = await User.find({ _id: { $ne: req.user._id } }).select("-password -__v")
        // check if users exists
        if(!users){
            return next(new AppError("Users not found", 400))
        }
        return res.status(200).json(users);

        
    } catch (error) {
        next(new AppError("Internal server error", 500));
        
    }
}

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