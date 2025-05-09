import { X, Video } from "lucide-react";
import { Link } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import getLastSeen from "../lib/lastSeen";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  return (
    <div className="p-7 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <Link to={`/profile/${selectedUser._id}`} className="avatar">
            <div className="avatar">
              <div className="size-10 rounded-full relative">
                <img
                  src={selectedUser.profilePic}
                  alt={selectedUser.fullName}
                />
              </div>
            </div>
          </Link>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="flex items-center gap-2 text-sm text-base-content/70">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  onlineUsers.includes(selectedUser._id)
                    ? "bg-green-500"
                    : "bg-zinc-400"
                }`}
              />
              {onlineUsers.includes(selectedUser._id)
                ? "Online"
                : getLastSeen(selectedUser)}
            </p>
          </div>
        </div>
        {/* Call button */}
        <div className=" flex justify-center gap-10 ">
          <Link
            to={`/call/${selectedUser._id}`}
            className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition duration-200 cursor-pointer mx-auto "
          >
            <Video className="w-5 h-5" />
          </Link>
          
        {/* Close button */}
        <button onClick={() => setSelectedUser(null)}>
          <X />
        </button>
        </div>

        
      </div>
    </div>
  );
};
export default ChatHeader;
