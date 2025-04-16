import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    // select: false, // don't return password by default
  },
  profilePic: {
    type: String,
    default: "https://www.gravatar.com/avatar/?d=mp&f=y",
  },
}, {
    timestamps: true,
    versionKey: false,
});


const User = mongoose.model("User", userSchema);
export default User;