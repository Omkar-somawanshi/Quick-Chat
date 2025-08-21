import React from "react";
import assets, { imagesDummyData } from "../assets/assets";

const RightSidebar = ({ selectedUser }) => {
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
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
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
          {imagesDummyData.map((url, index) => (
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
          ))}
        </div>
      </div>

      {/* Logout Button */}
      <button
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
