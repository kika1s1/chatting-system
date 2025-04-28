import mongoose from "mongoose";

const usedTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
    },
    isUsed: {
        type: Boolean,
        default: false,
    }, 
}, {
    timestamps: true,
    
})
const UsedToken = mongoose.model("UsedToken", usedTokenSchema);
export default UsedToken;