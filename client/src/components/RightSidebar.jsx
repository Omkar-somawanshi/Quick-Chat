import React from "react";
import assets from "../assets/assets";

const RightSidebar = ({ selectedUser }) => {
  if (!selectedUser) return null; // don't render if no user selected

  return (
    <div
      className="bg-[#818582]/10 text-white w-full relative overflow-y-scroll max-md:hidden"
    >
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
        <p className="px-10 mx-auto">{selectedUser?.bio}</p>
      </div>
    </div>
  );
};

export default RightSidebar;
