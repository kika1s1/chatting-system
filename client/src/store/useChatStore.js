import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/users");
      
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data});
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  },

  updateMessage: async (id, updateData) => {
    const { messages } = get();
    try {
      const res = await axiosInstance.put(`/messages/${id}`, updateData);
      set({
        messages: messages.map(m =>
          m._id === id ? res.data : m
        )
      });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  },

  deleteMessage: async (id) => {
    const { messages } = get();
    try {
      await axiosInstance.delete(`/messages/${id}`);
      set({ messages: messages.filter(m => m._id !== id) });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isFromSelected = newMessage.senderId === selectedUser._id;
      if (!isFromSelected) return;
      set({
        messages: [...get().messages, newMessage],
      });
    });

    socket.on("messageDeleted", ({ id }) => {
      set({
        messages: get().messages.filter((m) => m._id !== id),
      });
    });

    socket.on("messageUpdated", (updated) => {
      set({
        messages: get().messages.map((m) =>
          m._id === updated._id ? updated : m
        ),
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messageDeleted");
    socket.off("messageUpdated");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));