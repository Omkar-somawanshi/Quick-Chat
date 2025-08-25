import React,{useEffect,useRef} from 'react'
import assets, { messagesDummyData } from '../assets/assets'
import { formatMessageTime } from '../lib/utils'


// Assuming a current user ID exists, which would come from your auth context
// or a prop. This is used to determine which messages are "sent" by the current user.

const ChatContainer = ({ selectedUser, setSelectedUser }) => {
  const scrollEnd = useRef();

  // This useEffect hook is now triggered whenever messagesDummyData changes,
  // ensuring the chat scrolls to the bottom on new messages.
  useEffect(() => {
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []); // The dependency array ensures this effect runs whenever messagesDummyData);


  return selectedUser ? (
    <div className="h-full overflow-hidden relative backdrop-blur-lg">

      {/* Header section with the selected user's profile info */}
      <div className='flex items-center gap-3 mx-4 p-4 border-b border-stone-500'>
        {/* Dynamic user image and name */}
        <img
          src={assets.profile_martin}
          alt=""
          className='w-8 rounded-full'
        />
        <p className='flex-1 text-lg text-white flex items-center gap-2 '>
          Martin Johnson
          <span className='w-2 h-2 rounded-full bg-green-500'></span>
        </p>

        {/* Arrow icon for mobile view to go back */}
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt=""
          className='md:hidden max-w-7 '
        />

        {/* Help icon for desktop view */}
        <img src={assets.help_icon} alt="Help" className='max-md:hidden max-w-5' />
      </div>

      {/* Chat Area */}
      {/* The height is calculated to fit within the container and allow scrolling */}
      <div className='flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6'>
        {messagesDummyData.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 justify-end ${msg.senderId !== '680f5116f10f3cd28382ed02' && 'flex-row-reverse'}`}>
            {msg.image ? (
              <img src={msg.image} alt="" className='max-w-[230px] border border-gray-700 rounded-lgoverflow-hidden md-8' />
            ) : (
              <p className={`p-2  max-w-[200px] md:text-sm  font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white ${msg.senderId === '680f5116f10f3cd28382ed02' ? 'rounded-br-none' : 'rounded-bl-none' }`}> {msg.text}</p>
              )}
            <div className="text-center text-xs">
              <img src={msg.senderId === '680f5116f10f3cd28382ed02' ? assets.profile_icon : assets.profile_martin}alt="" className='w-7 rounded-full'/>
              <p className='text-gray-500'>{formatMessageTime( msg.createdAt) }</p>
              </div>

    
            </div>
          ))}
          <div ref={scrollEnd}></div>
        </div>
{/*---------bottom area--------*/ }
<div className='absolute bottom-3 left-0 right-0 flex items-center gap-3 p-3'>
  <div className='flex-1 flex items-center bg-gray-100/12 px-3 rounded-full'>
    <input type="text" placeholder='Send a message'
    className='flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400'/>
    <input type="file" id='image' accept='image/png, image/jpeg' hidden/>
    <label htmlFor="image">
    <img src={assets.avatar_icon}alt="" className='w-5 mr-2 cursor-pointer' />
</label>
  </div>
<img src={assets.send_button} alt="" className='w-7 cursor-pointer'/>
</div>



    </div>
  ) : (
    <div className='flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden'>
      <img src={assets.logo_icon} className='max-w-16' alt="" />
      <p className='text-lg font-medium text-white '> Chat anytime , anywhere</p>
      </div>

  )
}
        
         
                 
             

            
     

export default ChatContainer
