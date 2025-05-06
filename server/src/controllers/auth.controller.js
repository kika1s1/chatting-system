import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import User from "../models/user.model.js";
import AppError from "../lib/AppError.js";
import generateToken from "../lib/generateToken.js";
import { upsertStreamUser } from "../lib/stream.js";

export const signup = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;
    // check if user already exists
    // check all find is provided
    if (!fullName || !email || !password) {
      return next(new AppError("Please provide all fields", 400));
    }
    // check if password is strong
    if (password.length < 6) {
      return next(
        new AppError("Password must be at least 6 characters long", 400)
      );
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new AppError("User already exists", 400));
    }
    // hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    // create user
    const user = new User({
      fullName,
      email,
      password: hashedPassword,
    });
    // save user to db
    await user.save();
    // verify email 
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,  // Your Gmail address
        pass: process.env.EMAIL_PASS,  // Your Gmail app password
      },
    });
    const baseUrl = "https://chatting-system-fvfc.onrender.com";
    const verifyLink = process.env.NODE_ENV === "production" 

      ? `${baseUrl}/verify/${user._id}`
      : `http://localhost:5173/verify-email/${user._id}`;
    const mailOptions = {
      from: 'Friends App',
      to: email,
      subject: "Verify Your Email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;"></div>
          <h2 style="color: #333;">Verify Your Email</h2>
          <p style="font-size: 16px;">Thank you for signing up! Please click the button below to verify your email address:</p>
          <a href="${verifyLink}" style="display: inline-block; margin: 20px 0; padding: 12px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">Verify Email</a>
          <p style="font-size: 14px; color: #777;">If you didn't sign up, just ignore this email.</p>
          <p style="font-size: 14px; color: #777;">This link will expire in 1 hour.</p>
        </div>
      `,
    };
    // Send verification email
    await transporter.sendMail(mailOptions);
    // send verification email
    
    
    // generate token
    const token = generateToken(user._id, "1h");
    // exclude password from user object
    const { password: excludedPassword, ...userInfo } = user._doc;
    // send token in cookie
    
    try {
      console.log(user._id.toString())
      await upsertStreamUser({
        id: user._id.toString(),
        name: fullName,
        email,
        image: user.profilePic || "",
      })
      console.log("Stream user upserted successfully:", user._id.toString());
  
    } catch (error) {
      console.error("Error upserting Stream user:", error);
      return next(new AppError("Failed to create Stream user", 500));
      
    }


    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        samesite: "strict",
      })
      .status(201)
      .json({
        success: true,
        message: "User created successfully",
        ...userInfo,
      });
  } catch (error) {
    next(new AppError(error.message || "internal server error!", 500));
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // check email and password are provided
    if (!email || !password) {
      return next(new AppError("Please provide all fields", 400));
    }
    // check if user exists
    const userExists = await User.findOne({ email });
    if (!userExists) {
      // tell them wrong  credentials
      return next(new AppError("Wrong email or password", 400));
    }
    // check if password is correct
    const isPasswordCorrect = bcrypt.compareSync(password, userExists.password);
    if (!isPasswordCorrect) {
      return next(new AppError("Wrong email or password", 400));
    }
    // generate token
    const token = generateToken(userExists._id, "1h");
    // exclude password from user object
    const { password: excludedPassword, ...userInfo } = userExists._doc;
    // send token in cookie
    console.log(userInfo)
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        samesite: "strict",
      })
      .status(200)
      .json({
        success: true,
        message: "User logged in successfully",
        ...userInfo,
      });
  } catch (error) {
    next(new AppError(error.message || "internal server error!", 500));
  }
};

export const google = async (req, res, next) => {
  try {
    const { fullName, email, profilePic } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      // generate token
      const token = generateToken(user._id, "1h");
      const { password: pwd, ...userInfo } = user._doc;
      return res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          samesite: "strict",
        })
        .status(200)
        .json({
          success: true,
          message: "User logged in successfully",
          ...userInfo,
        });
    }
    // generate password
    const generatedPassword = Math.random().toString(36).slice(-8);
    // hash password
    const salt = bcrypt.genSaltSync(10);
    // hash password with email as salt
    const hashedPassword = bcrypt.hashSync(generatedPassword, salt);


    user = await User({
      fullName,
      email,
      password: hashedPassword,
      profilePic,
    });
    await user.save();
    // generate token
    const token = generateToken(user._id, "1h");
    
    const { password: pwd, ...userInfo } = user._doc;
    // upsert stream user
    try {
      await upsertStreamUser({
        id: user._id.toString(),
        name: fullName,
        email,
        image: profilePic || "",
      });
      console.log("Stream user upserted successfully:", user._id.toString());
    } catch (error) {
      console.error("Error upserting Stream user:", error);
      return next(new AppError("Failed to create Stream user", 500));
    }
    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        samesite: "strict",
      })
      .status(200)
      .json({
        success: true,
        message: "User logged in successfully",
        ...userInfo,
      });
  } catch (error) {
    next(new AppError(error.message || "internal server error!", 500));
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { id } = req.params;
    // check if user exists
    const userExists = await User.findById(id);
    // check if user won't exist
    if (!userExists) {
      return next(new AppError("User not found", 400));
    }
    // check if user is already verified
    if (userExists.isVerified) {
      return next(new AppError("User is already verified", 400));
    }
    // verify user
    userExists.isVerified = true;
    await userExists.save();
    // exclude password from user object
    const { password: excludedPassword, ...userInfo } = userExists._doc;
    // send token in cookie
    const token = generateToken(userExists._id, "1h");
    console.log(userExists)
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        samesite: "strict",
      })
      .status(200)
      .json({
        success: true,
        message: "User verified successfully",
        ...userInfo,
      });
  } catch (error) {
    next(new AppError(error.message || "internal server error!", 500));
  }
};


export const logout = async (req, res, next) => {
  try {
    res
      .clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        samesite: "strict",
      })
      .status(200)
      .json({
        success: true,
        message: "User logged out successfully",
      });
  } catch (error) {
    next(new AppError(error.message || "internal server error!", 500));
  }
};
export const updateProfile = async (req, res, next) => {
  try {
    const { profilePic } = req.body;

    // check if user exists
    const userExists = await User.findById(req.user._id);
    // check if user won't exist
    if (!userExists) {
      return next(new AppError("User not found", 400));
    }
    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    // update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        profilePic: uploadResponse.secure_url || userExists.profilePic,
      },
      { new: true }
    );
    // exclude password from user object
    const { password: excludedPassword, ...userInfo } = updatedUser._doc;
    // upsert stream user
    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        email: updatedUser.email,
        image: uploadResponse.secure_url || userExists.profilePic,
      });
      console.log("Stream user upserted successfully:", updatedUser._id.toString());
    } catch (error) {
      console.error("Error upserting Stream user:", error);
      return next(new AppError("Failed to create Stream user", 500));
    }
    // send token in cookie

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      ...userInfo,
    });
  } catch (error) {
    next(new AppError(error.message || "internal server error!", 500));
  }
};
export const checkAuth = async (req, res, next) => {
  try {
    // check if user exists
    const userExists = req.user;
    // check if user won't exist
    if (!userExists) {
      return next(new AppError("User not found", 400));
    }
    // exclude password from user object
    // send token in cookie
    res.status(200).json({
      success: true,
      message: "Auth is made successfully",
      ...userExists._doc,
    });
  } catch (error) {
    next(new AppError(error.message || "internal server error!", 500));
  }
};

export const forget = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (!userExists) {
      return next(new AppError("User not found", 400));
    }

    // Generate token for password reset (valid for 2 minutes)
    const token = generateToken(userExists._id, "2m");

    // Save the reset token and expiry time to the user's document
    userExists.resetPasswordToken = token;
    userExists.resetPasswordExpires = Date.now() + 3600000;  // 1 hour expiry
    await userExists.save();

    const baseUrl = "https://chatting-system-fvfc.onrender.com";
    const resetLink = process.env.NODE_ENV === "production" 
      ? `${baseUrl}/reset/${token}` 
      : `http://localhost:5173/reset/${token}`;

    // Setup transporter for sending email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,  // Your Gmail address
        pass: process.env.EMAIL_PASS,  // Your Gmail app password
      },
    });

    // Email options
    const mailOptions = {
      from: 'Friends App',
      to: email,
      subject: "Reset Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #333;">Reset Your Password</h2>
          <p style="font-size: 16px;">Forgot your password? No worries. Click the button below to reset it:</p>
          <a href="${resetLink}" style="display: inline-block; margin: 20px 0; padding: 12px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">Reset Password</a>
          <p style="font-size: 14px; color: #777;">If you didn't request a password reset, just ignore this email.</p>
          <p style="font-size: 14px; color: #777;">This link will expire in 1 hour.</p>
        </div>
      `,
    };

    // Send reset link email
    await transporter.sendMail(mailOptions);

    // Success response
    res.status(200).json({
      success: true,
      message: "Reset link sent to your email",
    });
  } catch (error) {
    console.log(error);
    next(new AppError(error.message || "internal server error!", 500));
  }
};


export const reset = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Find user by reset password token and check if it's still valid
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },  // Check if the token has not expired
    });

    if (!user) {
      return next(new AppError("Invalid or expired token", 400));
    }

    // Hash the new password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Update user's password
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;  // Remove the reset token
    user.resetPasswordExpires = undefined;  // Remove the expiry time
    await user.save();

    // Exclude password from response
    const { password: excludedPassword, ...userInfo } = user._doc;

    // Generate new JWT token after password reset
    const newToken = generateToken(user._id, "1h");

    // Send the new token in the response
    res
      .cookie("token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,  // 1 week expiry for the cookie
        samesite: "strict",
      })
      .status(200)
      .json({
        success: true,
        message: "Password reset successfully",
        ...userInfo,
      });
  } catch (error) {
    console.log(error);
    next(new AppError(error.message || "internal server error!", 500));
  }
};
