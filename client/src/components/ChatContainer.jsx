import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { FiCheck, FiX } from "react-icons/fi";

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
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  const [editingId, setEditingId] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);

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

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMine = msg.senderId === authUser._id;
          const isEditing = editingId === msg._id;

          return (
            <div
              key={msg._id}
              className={`chat ${isMine ? "justify-end" : "justify-start"}`}
              ref={messageEndRef}
            >
              <div className="flex flex-col max-w-md">
                <div className="flex items-center space-x-2 mb-1">
                  {isMine && !isEditing && (
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
                              setEditingId(msg._id);
                              setEditedText(msg.text);
                              setMenuOpenId(null);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="w-full px-3 py-2 text-left text-sm text-gray-400 hover:bg-slate-100"
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

                <div
                  className={`p-3 rounded-lg ${
                    isMine
                      ? "bg-slate-100 text-slate-800 self-end"
                      : "bg-slate-100 text-slate-800 self-start"
                  }`}
                >
                  {isEditing ? (
                    <>
                      <textarea
                        className="w-full  resize-none border-slate-300 rounded p-2 mb-2"
                        rows={2}
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          className="px-3 py-1 bg-slate-600 hover:bg-slate-700 cursor-pointer text-white rounded text-sm flex items-center space-x-1"
                          onClick={async () => {
                            await updateMessage(msg._id, { text: editedText });
                            setEditingId(null);
                          }}
                        >
                          <FiCheck />
                          <span>Save</span>
                        </button>
                        <button
                          className="px-3 cursor-pointer py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-sm flex items-center space-x-1"
                          onClick={() => setEditingId(null)}
                        >
                          <FiX />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {!isEditing && (
                        <>
                          {msg.image && (
                            <img
                              src={msg.image}
                              alt="attachment"
                              className="rounded-md mb-2 max-w-xs"
                            />
                          )}
                          <div className="flex items-baseline space-x-2">
                            <p className="break-words">{msg.text}</p>
                            {/* show Edited if updatedAt is newer */}
                            {new Date(msg.updatedAt) >
                              new Date(msg.createdAt) && (
                              <span className="text-xs italic text-slate-500">
                                Edited
                              </span>
                            )}
                          </div>
                          <time className="text-xs text-gray-400">
                            {formatMessageTime(msg.createdAt)}
                          </time>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
