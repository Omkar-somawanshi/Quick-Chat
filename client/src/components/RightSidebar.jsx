import React, { useState, useContext, useEffect } from "react"; // ✅ Added useState import
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import assets from "../assets/assets";

const RightSidebar = () => {
  const { selectedUser, messages } = useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);
  const [msgImages, setMsgImages] = useState([]);

  useEffect(() => {
    setMsgImages(
      messages.filter(msg => msg.image).map(msg => msg.image)
    );
  }, [messages]); // ✅ Fixed missing closing parenthesis

  if (!selectedUser) return null; // Don't render if no user selected

  return (
    <div className="bg-[#818582]/10 text-white w-full relative overflow-y-scroll max-md:hidden">
      {/* User Info */}
      <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto">
        <img
          src={selectedUser?.profilePic || assets.avatar_icon}
          alt="User Avatar"
          className="w-20 aspect-[1/1] rounded-full"
        />
        <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-2">
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500"></span> // ✅ Fixed styling
          )}
          {selectedUser?.fullName}
        </h1>
        <p className="px-10 mx-auto text-center">{selectedUser?.bio}</p>
      </div>

      {/* Divider */}
      <hr className="border-[#ffffff33] my-4" />

      {/* Media Section */}
      <div className="px-5 text-xs">
        <p className="mb-2 font-semibold text-gray-300">Media</p>
        <div className="mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-3 opacity-90">
          {/* ✅ Use actual message images instead of dummy data */}
          {msgImages.length > 0 ? (
            msgImages.map((url, index) => (
              <div
                key={index}
                onClick={() => window.open(url, "_blank")}
                className="cursor-pointer rounded overflow-hidden"
              >
                <img
                  src={url}
                  alt={`media-${index}`}
                  className="h-full w-full object-cover rounded-md"
                />
              </div>
            ))
          ) : (
            <p className="text-gray-400 col-span-2 text-center py-4">
              No media shared yet
            </p>
          )}
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={logout} // ✅ Added onClick handler
        className="absolute bottom-5 left-1/2 transform -translate-x-1/2 
                   bg-gradient-to-r from-purple-400 to-violet-600 
                   text-white border-none text-sm font-light py-2 px-20 
                   rounded-full cursor-pointer hover:opacity-90 transition"
      >
        Logout
      </button>
    </div>
  );
};

export default RightSidebar;
