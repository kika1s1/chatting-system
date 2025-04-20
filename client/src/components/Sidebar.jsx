import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      {/* Header */}
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-5 text-base-content" />
          <span className="font-semibold hidden lg:block">Contacts</span>
        </div>

        {/* Online Toggle */}
        <div className="mt-4 hidden lg:flex items-center justify-between text-sm text-zinc-500">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            Show online only
          </label>
          <span>({onlineUsers.length - 1} online)</span>
        </div>
      </div>

      {/* Users List */}
      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => {
          const isOnline = onlineUsers.includes(user._id);
          const isSelected = selectedUser?._id === user._id;

          return (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`w-full p-3 flex items-center gap-3 transition-all ${
                isSelected
                  ? "bg-base-300 ring-1 ring-base-200"
                  : "hover:bg-base-200"
              }`}
            >
              {/* Profile Picture with Status Dot */}
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={user.profilePic}
                  alt={user.fullName}
                  className="size-11 rounded-full object-cover"
                />
                {isOnline && (
                  <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-white" />
                )}
              </div>

              {/* Name + Status (on lg) */}
              <div className="hidden lg:block min-w-0 text-left">
                <div className="font-medium truncate text-base-content">
                  {user.fullName}
                </div>
                <div
                  className={`text-xs ${
                    isOnline ? "text-green-500" : "text-zinc-400"
                  }`}
                >
                  {isOnline ? "Online" : "Offline"}
                </div>
              </div>
            </button>
          );
        })}

        {/* No Users */}
        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-6 text-sm">
            No online users
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
