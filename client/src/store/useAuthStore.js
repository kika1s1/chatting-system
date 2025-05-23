import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import {io} from "socket.io-client"
import toast from "react-hot-toast";
const baseURL =  import.meta.env.VITE_NODE_ENV == "development" ? import.meta.env.VITE_SERVER_URL : "/"
export const useAuthStore = create((set, get) => ({
  authUser: null,
  onlineUsers: [],
  isSigningUp: false,
  isForgetting: false,
  isResetting: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  socket: null,
  user:null,

  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      if (res.status === 200) {
        set({ authUser: res.data, isCheckingAuth: false });
        get().connectSocket()
      } else {
        set({ isCheckingAuth: false });
      }
    } catch (error) {
      console.error(error.response.data.message);
      // toast.error(error.response.data.message);
      set({ authUser: null, isCheckingAuth: false });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signup: async(data)=>{
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      if (res.status === 201) {
        set({ authUser: res.data });
        toast.success("Account created successfully!");
        get().connectSocket()
      }
    } catch (error) {
      toast.error(error.response.data.message);
      console.error("Error signing up:", error);
    } finally {
      set({ isSigningUp: false });
    }
  },
  login: async(data)=>{
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      if (res.status === 200) {
        set({ authUser: res.data });
        toast.success("Logged in successfully!");
        get().connectSocket()

      }
    } catch (error) {
      if(error.response.status === 429) {
        toast.error(error.response.data);
        return;
      }
      console.error("Error logging in:", error.response.data.message);
      toast.error(error.response.data.message);
      // check for rate limit error
      
    } finally {
      set({ isLoggingIn: false });
    }
  },
  googleLogin: async (data) => {
    try {
      const res = await axiosInstance.post("/auth/google", data);
      if (res.status === 200) {
        set({ authUser: res.data });
        toast.success("Logged in successfully!");
        get().connectSocket()
      }
    } catch (error) {
      console.error("Error logging in:", error.response.data.message);
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },
  verifyEmail: async (query) => {
    try {
      const res = await axiosInstance.get(`/auth/verify-email?${query}`);
      if (res.status === 200) {
        toast.success("Email verified successfully!");

        set({ authUser: res.data });
        get().connectSocket()


      }
    } catch (error) {
      console.error("Error verifying email:", error.response.data.message);
      toast.error(error.response.data.message);
    }
  },
  sendVerification: async (data) => {
    try {
      const res = await axiosInstance.post("/auth/send-verification", data);
      if (res.status === 200) {
        toast.success("Verification email sent!");
      }
    } catch (error) {
      console.error("Error sending verification email:", error.response.data.message);
      toast.error(error.response.data.message);
    }
  },

  logout: async () => {
    try {
      const res = await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success(res.data.message);
      get().disconnectSocket()
    } catch (error) {
      toast.error(error.response.data.message);
      console.error("Error logging out:", error);
    }
  },
  forget: async (email) => {
    set({ isForgetting: true });
    try {
      const res = await axiosInstance.post("/auth/forget", { email });
      if (res.status === 200) {
        toast.success("Check your email for the reset link!");
      }
    } catch (error) {
      toast.error(error.response.data.message);
      console.error("Error resetting password:", error);
    } finally {
      set({ isForgetting: false });
    }
  },
  reset: async (data) => {
    set({ isResetting: true });
    try {
      const res = await axiosInstance.post(`/auth/reset/${data.token}`, {
        password: data.password,
      });
      if (res.status === 200) {
        toast.success("Password reset successfully!");
        set({ authUser: res.data });
        get().connectSocket()
      }
    } catch (error) {
      toast.error(error.response.data.message);
      console.error("Error resetting password:", error);
    } finally {
      set({ isResetting: false });
    }
  },
  updateProfile : async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      if (res.status === 200) {
        set({ authUser: res.data });
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      toast.error(error.response.data.message);
      console.error("Error updating profile:", error);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;
    
    const socket = io(baseURL, {
      query: {
        userId: authUser._id,
      },
    });
    
    // wait for socket to be connected before accessing .id
    socket.on("connect", () => {
      console.log("Socket connected with ID:", socket.id);
      set({ socket });
    });
    socket.on("getOnlineUsers", (onlineUsers) => {
      set({ onlineUsers });
    });
    
    // optionally handle errors
    socket.on("connect_error", (err) => {
      console.error("Socket connection failed:", err.message);
    });
  },
  disconnectSocket: () => {
    if(get().socket?.connected){
      get().socket.disconnect();
      console.log("Socket disconnected");

    }
  },
  getUser: async (id) => {
    try {
      const res = await axiosInstance.get(`/users/${id}`);

      if (res.status === 200) {
        set({ user: res.data });
      }
    } catch (error) {
      toast.error(error.response.data.message);
      console.error("Error getting user:", error);
    }
  },
}));
