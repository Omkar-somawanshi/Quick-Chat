import React, { useEffect } from 'react';

// Since the external files cannot be resolved in this environment,
// we'll define the assets and dummy data directly within this component.
const assets = {
  default_profile: "https://placehold.co/100x100/A0A0A0/FFFFFF?text=User",
  arrow_icon: "https://placehold.co/24x24/FFFFFF/000000?text=%3C",
  help_icon: "https://placehold.co/24x24/FFFFFF/000000?text=?",
  logo_icon: "https://placehold.co/64x64/FFFFFF/000000?text=Chat",
  avatar_icon: "https://placehold.co/100x100/8185B2/FFFFFF?text=Me",
};

const messagesDummyData = [
    { senderId: '680f50e4f10f3cd28382ecf9', text: 'Hey, how are you doing?', createdAt: new Date() },
    { senderId: '2a1b3c4d5e6f7g8h9i0j1k2l', text: 'I am good, thanks! What about you?', createdAt: new Date() },
    { senderId: '680f50e4f10f3cd28382ecf9', text: 'I am doing great!', createdAt: new Date() },
    { senderId: '2a1b3c4d5e6f7g8h9i0j1k2l', text: 'Cool, let me know if you want to hang out sometime.', createdAt: new Date() },
    { senderId: '680f50e4f10f3cd28382ecf9', text: 'Sounds good. I will.', createdAt: new Date() },
];

// This utility function formats the message time, which was previously in a separate file.
const formatMessageTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Assuming a current user ID exists, which would come from your auth context
// or a prop. This is used to determine which messages are "sent" by the current user.
const currentUserId = '680f50e4f10f3cd28382ecf9';

const ChatContainer = ({ selectedUser, setSelectedUser }) => {
  const scrollEnd = React.useRef();

  // This useEffect hook is triggered whenever a new user is selected,
  // ensuring the chat scrolls to the bottom for the new conversation.
  useEffect(() => {
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedUser]);


  // Only render the chat interface if a user is selected
  if (!selectedUser) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <img src={assets.logo_icon} className='max-w-16 mb-4' alt="App logo" />
        <p className='text-lg font-medium text-white text-center'>Chat Anytime, Anywhere</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden relative backdrop-blur-lg">

      {/* Header section with the selected user's profile info */}
      <div className='flex items-center gap-3 mx-4 p-4 border-b border-stone-500'>
        {/* Dynamic user image and name */}
        <img
          src={selectedUser.profileImage || assets.default_profile}
          alt={`${selectedUser.username}'s profile`}
          className='w-8 rounded-full'
        />
        <p className='flex-1 text-lg text-white flex items-center gap-2 '>
          {selectedUser.username}
          <span className='w-2 h-2 rounded-full bg-green-500'></span>
        </p>

        {/* Arrow icon for mobile view to go back */}
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt="Go back"
          className='md:hidden max-w-7 cursor-pointer'
        />

        {/* Help icon for desktop view */}
        <img src={assets.help_icon} alt="Help" className='max-md:hidden max-w-5' />
      </div>

      {/* Chat Area */}
      {/* The height is calculated to fit within the container and allow scrolling */}
      <div className='flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6'>
        {messagesDummyData.map((msg, index) => {
          const isMyMessage = msg.senderId === currentUserId;
          return (
            <div
              key={index}
              // Conditional classes for alignment and styling
              className={`flex items-end gap-2 ${isMyMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex flex-col">
                {msg.image ? (
                  <img
                    src={msg.image}
                    alt=""
                    className='max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8'
                  />
                ) : (
                  // Conditional background color for messages
                  <p
                    className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-2 break-all text-white ${
                      isMyMessage ? 'bg-green-600' : 'bg-gray-700'
                    }`}
                  >
                    {msg.text}
                  </p>
                )}
                <p className={`text-gray-500 text-xs text-right mb-8 ${isMyMessage ? 'pr-1' : 'pl-1'}`}>
                  {formatMessageTime(msg.createdAt)}
                </p>
              </div>

              {/* Sender's avatar */}
              <div className="text-center">
                <img
                  src={isMyMessage ? assets.avatar_icon : selectedUser.profileImage || assets.default_profile}
                  alt="sender avatar"
                  className='w-7 rounded-full'
                />
              </div>
            </div>
          );
        })}
        {/* Ref for auto-scrolling to the bottom of the chat */}
        <div ref={scrollEnd}></div>
      </div>
    </div>
  );
};

export default ChatContainer;
