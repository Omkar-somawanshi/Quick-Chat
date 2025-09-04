import React, { useContext } from "react"; // ✅ Removed useState import
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import { ChatContext } from "../../context/ChatContext";

const HomePage = () => {
  const { selectedUser } = useContext(ChatContext); // ✅ Only get from context
  // ✅ Removed duplicate useState declaration

  return (
    <div className="border w-full h-screen sm:px-[15%] sm:py-[5%]">
      <div
        className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl
          overflow-hidden h-[100%] grid grid-cols-1 relative
          ${
            selectedUser
              ? "md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]"
              : "md:grid-cols-2"
          }`}
      >
        {/* Left Sidebar */}
        <Sidebar />

        {/* Chat Section */}
        <ChatContainer /> {/* ✅ Removed unnecessary props since ChatContainer gets data from context */}

        {/* Right Sidebar → Show only if user is selected */}
        {selectedUser && <RightSidebar />}
      </div>
    </div>
  );
};

export default HomePage;
