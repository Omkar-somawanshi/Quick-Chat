import React, { useContext } from "react";
import assets, { userDummyData } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Sidebar = ({ selectedUser, setSelectedUser }) => {
  // Destructure the `logout` function from AuthContext
  const { logout, onlineUsers } = useContext(AuthContext); 
  const navigate = useNavigate();

  // Determine if a user is online by checking if their ID is in the onlineUsers array
  const isUserOnline = (userId) => onlineUsers.includes(userId);

  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-5 border-r-xl overflow-y-scroll text-white ${
        selectedUser ? "max-md:hidden" : ""
      }`}
    >
      <div className="pb-5">
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="logo" className="max-w-40" />
          <div className="relative py-2 group">
            <img
              src={assets.menu_icon}
              alt="Menu"
              className="max-h-5 cursor-pointer"
            />
            <div className="absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100 hidden group-hover:block">
              <p
                onClick={() => navigate("/profile")}
                className="cursor-pointer text-sm"
              >
                Edit Profile
              </p>
              <hr className="my-2 border-t border-gray-500" />
              {/* This onClick handler is corrected to properly call the function */}
              <p onClick={() => logout()} className="cursor-pointer text-sm">
                Logout
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#282142] rounded full flex items-center gap-2 px-4 py-3 mt-5">
          <img src={assets.search_icon} alt="Search" className="w-3" />
          <input
            type="text"
            className="bg-transparent border-none outline-none text-white text-xs placeholder:[#c8c8c8] flex-1"
            placeholder="Search User...."
          />
        </div>
      </div>
      <div className="flex flex-col">
        {userDummyData.map((user) => (
          <div
            onClick={() => setSelectedUser(user)}
            // Changed key from 'index' to a unique user ID for better React performance
            key={user._id}
            className={`relative flex items-center gap-2 p-2 pl-4 rounded-md cursor-pointer max-sm:text-sm ${selectedUser?._id === user._id && `bg-[#282142]/50`}`}
          >
            <img
              src={user?.profilePic || assets.avatar_icon}
              alt="User profile"
              className="w-[35px] aspect-[1/1] rounded-full"
            />
            <div className='flex flex-col leading-5'>
              <p>{user.fullName}</p>
              {
                // Now using the `isUserOnline` function with the `onlineUsers` state
                isUserOnline(user._id)
                  ? <span className="text-green-400 text-xs">Online</span>
                  : <span className="text-neutral-400 text-xs">Offline</span>
              }
            </div>
            {/* The logic for unread messages remains the same */}
            {user.unreadMessages > 0 && <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">{user.unreadMessages}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
