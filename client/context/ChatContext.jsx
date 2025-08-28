import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "./AuthContext";

export const chatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios } = useContext(AuthContext);
  
  // Function to get all users for sidebar
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`); 
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  const sendMessage = async (message) => {
    try {
      const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, message);
      if (data.success) {
        setMessages((prevMessages) => [...prevMessages, data.newMessage]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Function to subscribe to messages for selected user
  const subscribeToMessages = () => {
    if (!socket) return;
    
    socket.on("new-message", (newMessage) => {
      // Corrected variable name from 'mewMessage' to 'newMessage'
      if (selectedUser && newMessage.sender._id === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessages((prevUnseenMessages) => ({
          ...prevUnseenMessages, 
          [newMessage.sender._id]: prevUnseenMessages[newMessage.sender._id] ? prevUnseenMessages[newMessage.sender._id] + 1 : 1,
        }));
      }
    });
  };

  // Function to unsubscribe from messages
  const unsubscribeFromMessages = () => {
    if (!socket) return;
    socket.off("new-message");
  };

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [socket, selectedUser]);
  
  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    getMessages, // Added this function to the value object
    setMessages,
    sendMessage,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
  };

  return (
    <chatContext.Provider value={value}>
      {children}
    </chatContext.Provider>
  );
};

export default ChatProvider;