import rateLimit from "express-rate-limit";
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per `window` (here, per 15 minutes)
    message:
        "Too many login attempts from this IP, please try again after a while.",
    });


export default loginLimiter;