import { useParams } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect, useState } from "react";

export const User = () => {
  const { id } = useParams();
  const { authUser, getUser, user } = useAuthStore();
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (id) {
      getUser(id);
    }
  }, [id, getUser]);

  useEffect(() => {
    if (authUser && user) {
      setIsFollowing(authUser.following?.includes(user._id));
    }
  }, [authUser, user]);

  const handleFollow = async () => {
    try {
      await fetch(`/api/follow/${user._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerId: authUser._id }),
      });
      setIsFollowing(true);
    } catch (error) {
      console.error("Failed to follow:", error);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const isOwnProfile = authUser?._id === user._id;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="relative bg-white shadow-md rounded-2xl p-8 max-w-md w-full flex flex-col">
        {/* Profile Info */}
        <img
          src={user.profilePic}
          alt={user.fullName}
          className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
        />
        <h2 className="text-2xl font-bold text-gray-800 mb-1 text-center">{user.fullName}</h2>
        <p className="text-gray-500 mb-4 text-center">{user.email}</p>

        <div className="flex flex-col items-center text-sm text-gray-400 space-y-2 mb-8">
          <p>
            <span className="font-semibold text-gray-600">Joined:</span>{" "}
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
          <p>
            <span className="font-semibold text-gray-600">Last Updated:</span>{" "}
            {new Date(user.updatedAt).toLocaleDateString()}
          </p>
        </div>

        {/* Follow/Message Buttons at bottom-right */}
        {!isOwnProfile && (
          <div className="absolute bottom-4 right-4 flex gap-3">
            <button
              onClick={handleFollow}
              disabled={isFollowing}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition
                ${isFollowing ? "bg-green-500 text-white cursor-default" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>

            <button className="px-4 py-2 rounded-full text-sm bg-gray-200 hover:bg-gray-300 transition">
              Message
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
