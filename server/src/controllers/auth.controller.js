import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
import AppError from "../lib/AppError.js";
import generateToken from "../lib/generateToken.js";

export const signup =async(req, res, next)=>{
    try {
        const {fullName, email, password} = req.body;
        // check if user already exists
        // check all find is provided
        if(!fullName || !email || !password){
            return next(new AppError("Please provide all fields", 400))
        }
        // check if password is strong
        if(password.length < 6){
            return next(new AppError("Password must be at least 6 characters long", 400))
        }
        const userExists = await User.findOne({email});
        if(userExists){
            return next(new AppError("User already exists", 400))
        }
        // hash password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
        // create user
        const user = new User({
            fullName,
            email,
            password: hashedPassword,
        })
        // save user to db
        await user.save();
        // generate token
        const token = generateToken(user._id);
        // exclude password from user object
        const { password:excludedPassword, ...userInfo } = user._doc;
        // send token in cookie
        res.cookie("token", token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            maxAge: 7 * 24 * 60 * 60 * 1000,
            samesite: "strict",
        }).status(201).json({
            success: true,
            message: "User created successfully",
            ...userInfo,
        })

        
    } catch (error) {
        next(new AppError(error.message|| "internal server error!", 500))
    }
}





export const login = async(req, res, next)=>{
    try {
        const {email, password} = req.body;
        // check email and password are provided
        if(!email || !password){
            return next(new AppError("Please provide all fields", 400))
        }
        // check if user exists
        const userExists = await User.findOne({email});
        if(!userExists){
            // tell them wrong  credentials
            return next(new AppError("Wrong email or password", 400))
        }
        // check if password is correct
        const isPasswordCorrect = bcrypt.compareSync(password, userExists.password);
        if(!isPasswordCorrect){
            return next(new AppError("Wrong email or password", 400))
        }
        // generate token
        const token = generateToken(userExists._id);
        // exclude password from user object
        const { password:excludedPassword, ...userInfo } = userExists._doc;
        // send token in cookie
        res.cookie("token", token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            maxAge: 7 * 24 * 60 * 60 * 1000,
            samesite: "strict",
        }).status(200).json({
            success: true,
            message: "User logged in successfully",
            ...userInfo,
        })
        
    } catch (error) {
        next(new AppError(error.message|| "internal server error!", 500))
        
    }
}
export const logout = async(req, res, next)=>{
    try {
        res.clearCookie("token", {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            maxAge: 7 * 24 * 60 * 60 * 1000,
            samesite: "strict",
        }).status(200).json({
            success: true,
            message: "User logged out successfully",
        })
        
    } catch (error) {
        next(new AppError(error.message|| "internal server error!", 500))
        
    }
}