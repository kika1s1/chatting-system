import User from "../models/user.model.js";

export const getAllUsers = async(req, res, next)=>{
    try {
        const users = await User.find({ _id: { $ne: req.user._id } }).select("-password -__v")
        // check if users exists
        if(!users){
            return next(new AppError("Users not found", 400))
        }
        return res.status(200).json(users);

        
    } catch (error) {
        
    }
}