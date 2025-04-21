import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";   // ensure socket is available
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    deleteMessage,
    updateMessage,
    sendMessage,
  } = useChatStore();
  const { authUser, socket } = useAuthStore();       // add socket
  const messageEndRef = useRef(null);

  // message being edited
  const [editingMsg, setEditingMsg] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);  // new

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
      subscribeToMessages();
      return () => unsubscribeFromMessages();
    }
  }, [selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // typing indicator
  useEffect(() => {
    if (!socket || !selectedUser) return;
    socket.on("typing", ({ senderId }) => {
      if (senderId === selectedUser._id) setIsTyping(true);
    });
    socket.on("stopTyping", ({ senderId }) => {
      if (senderId === selectedUser._id) setIsTyping(false);
    });
    return () => {
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [socket, selectedUser]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput
          initialText=""
          editingId={null}
          onSend={async ({ text, image }) => await sendMessage({ text, image })}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMine = msg.senderId === authUser._id;
          return (
            <div
              key={msg._id}
              className={`chat ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div className="flex flex-col max-w-md">
                <div className="flex items-center space-x-2 mb-1">
                  {isMine && (
                    <div className="relative">
                      <button
                        className="px-2 text-slate-600 hover:bg-slate-200 rounded"
                        onClick={() =>
                          setMenuOpenId(menuOpenId === msg._id ? null : msg._id)
                        }
                      >
                        …
                      </button>
                      {menuOpenId === msg._id && (
                        <div className="absolute right-0 mt-1 w-28 bg-slate-50 border border-slate-300 rounded shadow-lg z-20">
                          <button
                            className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                            onClick={() => {
                              setEditingMsg(msg);
                              setMenuOpenId(null);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-slate-100"
                            onClick={() => {
                              deleteMessage(msg._id);
                              setMenuOpenId(null);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className={`p-3 rounded-lg ${isMine ? "bg-slate-200 text-slate-800 self-end" : "bg-slate-100 text-slate-800 self-start"}`}>          
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="attachment"
                      className="rounded-md mb-2 max-w-xs"
                    />
                  )}
                  <div className="flex items-baseline space-x-2">
                    <p className="break-words">{msg.text}</p>
                    {new Date(msg.updatedAt) > new Date(msg.createdAt) && (
                      <span className="text-xs italic text-slate-500">Edited</span>
                    )}
                  </div>
                  <time className="text-xs text-gray-400">
                    {formatMessageTime(msg.createdAt)}
                  </time>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>

      {/* typing indicator */}
      {isTyping && (
        <div className="px-4 py-2 text-sm italic text-slate-500">
          {selectedUser.fullName} is typing...
        </div>
      )}

      <MessageInput
        initialText={editingMsg ? editingMsg.text : ""}
        editingId={editingMsg ? editingMsg._id : null}
        onSend={async ({ text, image, editingId }) => {
          if (editingId) {
            await updateMessage(editingId, { text });
            setEditingMsg(null);
          } else {
            await sendMessage({ text, image });
          }
        }}
      />
    </div>
  );
};

export default ChatContainer;
