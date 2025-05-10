import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import User from "../models/user.model.js";
import AppError from "../lib/AppError.js";
import generateToken from "../lib/generateToken.js";
import { upsertStreamUser } from "../lib/stream.js";
import sendEmail from "../lib/send-email.js";

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
    // verify email 
    const token = generateToken(user._id, "1h");
    user.verificationToken = token;
    user.verificationTokenExpires = Date.now() + 3600000; // 1 hour expiry
    await user.save();


    const baseUrl = `https://chatting-system-fvfc.onrender.com/verify-email/?token=${token}&email=${encodeURIComponent(user.email)}`;
    const verifyLink = process.env.NODE_ENV === "production" 

      ? baseUrl
      : `http://localhost:5173/verify-email/?token=${token}&email=${encodeURIComponent(user.email)}`;
    
    await sendEmail(
      user.email,
      user.fullName,
      verifyLink,
      "Verify your email address",
      "Verify Email",
      "Please verify your email address to complete the registration process.",
      "Complete Email Verification"
    );
 
    
    
    // generate token
    // exclude password from user object
    const { password: excludedPassword, ...userInfo } = user._doc;
    
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

    // send token in cookie

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
      isVerified: true,
    });
    await user.save();
    // generate token
    const token = generateToken(user._id, "1h");
    
    const { password: pwd, ...userInfo } = user._doc;
    // awat upsertstream user
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
    const { token, email } = req.query;
    // Find user by token and email
    const user = await User.findOne({
      verificationToken: token,
      email,
      verificationTokenExpires: { $gt: Date.now() }, // Check if the token has not expired
    });
    if (!user) {
      return next(new AppError("Invalid or expired token", 400));
    }
    // Update user's email verification status
    user.isVerified = true;
    user.verificationToken = undefined; // Remove the verification token
    user.verificationTokenExpires = undefined; // Remove the expiry time
    await user.save();
    // Exclude password from response
    const { password: excludedPassword, ...userInfo } = user._doc;
    // Generate new JWT token after email verification
    const newToken = generateToken(user._id, "1h");
    // Send the new token in the response
    res
      .cookie("token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week expiry for the cookie
        samesite: "strict",
      })
      .status(200)
      .json({
        success: true,
        message: "Email verified successfully",
        ...userInfo,
      });
  }
  catch (error) {
    console.log(error);
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

      // send email with reset link
    await sendEmail(
      userExists.email,
      userExists.fullName,
      resetLink,
      "Reset your password",
      "Reset Password",
      "Click the button below to reset your password.",
      "Password Reset Request"
    );

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
export const sendVerification = async (req, res, next) => {
  try {
    const { id } = req.body;
    // Check if user exists
    const userExists = await User.findById(id);
    if (!userExists) {
      return next(new AppError("User not found", 400));
    }

    // Generate token for email verification (valid for 1 hour)
    const token = generateToken(userExists._id, "1h");
    // Save the verification token to the user's document
    userExists.verificationToken = token;
    userExists.verificationTokenExpires = Date.now() + 3600000; // 1 hour expiry
    await userExists.save();
    const baseUrl = `https://chatting-system-fvfc.onrender.com/verify-email/?token=${token}&email=${encodeURIComponent(userExists.email)}`;
    const verifyLink =
      process.env.NODE_ENV === "production"
        ? baseUrl
        : `http://localhost:5173/verify-email/?token=${token}&email=${encodeURIComponent(
            userExists.email
          )}`;
    await sendEmail(
      userExists.email,
      userExists.fullName,
      verifyLink,
      "Verify your email address",
      "Verify Email",
      "Please verify your email address to complete the registration process.",
      "Email Verification"
    );

        res.status(200).json({
          success: true,
          message: "Verification email sent successfully",
        });
      } catch (error) {
        next(new AppError(error.message || "internal server error!", 500));
      }
    };



export const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;

    // Check if user exists
    const userExists = await User.findById(req.user._id);
    if (!userExists) {
      return next(new AppError("User not found", 400));
    }

    // Check if password is correct
    const isPasswordCorrect = bcrypt.compareSync(password, userExists.password);
    if (!isPasswordCorrect) {
      return next(new AppError("Wrong password", 400));
    }

    // Delete user account
    await User.findByIdAndDelete(req.user._id);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    next(new AppError(error.message || "internal server error!", 500));
  }
}