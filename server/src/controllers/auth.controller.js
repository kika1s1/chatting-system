import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../lib/cloudinary.js";
import User from "../models/user.model.js";
import AppError from "../lib/AppError.js";
import generateToken from "../lib/generateToken.js";

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
    // generate token
    const token = generateToken(user._id);
    // exclude password from user object
    const { password: excludedPassword, ...userInfo } = user._doc;
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
    const token = generateToken(userExists._id);
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
      const token = generateToken(user._id);
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
    const token = generateToken(user._id);
    
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
    console.log(email);

    // check if user exists
    const userExists = await User.findOne({ email });
    if (!userExists) {
      return next(new AppError("User not found", 400));
    }

    // generate token
    const token = generateToken(userExists._id, "5m");
    let resetLink;
    if (process.env.NODE_ENV === "production") {
      const protocol = req.protocol; // http or https
      const host = req.get('host');  // localhost:5000 or yourdomain.com

      const baseUrl = `${protocol}://${host}`;

      resetLink = `${baseUrl}/reset/${token}`;
    }
    else{
      // reset link
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    resetLink = `${baseUrl}/reset/${token}`;
    }

    // setup transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail", // or your SMTP provider
      auth: {
        user: process.env.EMAIL_USER,  // Your Gmail address
        pass: process.env.EMAIL_PASS,  // Your Gmail app password
      },
    });

    // email options
    const mailOptions = {
      from: 'Friends App ',
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

    // send email
    await transporter.sendMail(mailOptions);

    // success response
    res.status(200).json({
      success: true,
      message: "Reset link sent to your email",
    });
  } catch (error) {
    console.log(error);
    next(new AppError(error.message || "internal server error!", 500));
  }
}
export const reset = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    console.log(token, password);
    // check if token is valid
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return next(new AppError("Invalid token", 400));
    }

    // check if user exists
    console.log(decoded);
    const userExists = await User.findById(decoded.userId);
    // check if user won't exist
    if (!userExists) {
      return next(new AppError("User not found", 400));
    }
    // hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    // update user
    const updatedInfo = await User.findByIdAndUpdate(
      decoded.userId,
      {
        password: hashedPassword,
      },
      { new: true }
    );
    // exclude password from user object
    const { password: excludedPassword, ...userInfo } = updatedInfo._doc;
    // generate token
    const newToken = generateToken(userExists._id);
    // send token in cookie
    res
      .cookie("token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
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