import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const { socket, axios, authUser } = useContext(AuthContext);

  // Fetch users and unseen messages
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages || {});
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Fetch messages for selected user
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
        
        // ✅ Reset unseen count for this user to 0
        setUnseenMessages(prev => {
          const updated = { ...prev };
          delete updated[userId];
          return updated;
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Send message to selected user
  const sendMessage = async (messageData) => {
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );
      if (data.success) {
        setMessages((prevMessages) => [...prevMessages, data.newMessage]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Subscribe to new messages via socket
  const subscribeToMessages = async () => {
    if (!socket) return;
    
    socket.on("newMessage", (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        // If viewing conversation with sender, add message and mark as seen
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        // Optionally mark as seen on server
        axios.put(`/api/messages/seen/${newMessage._id}`).catch(console.error);
      } else {
        // Update unseen count for other conversations
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
        }));
      }
    });

    // ✅ Listen for messages marked as seen
    socket.on("messagesMarkedSeen", ({ senderId }) => {
      // Refresh users to get updated unseen counts
      if (senderId === authUser?._id) {
        getUsers();
      }
    });
  };

  // Unsubscribe from socket events
  const unsubscribeFromMessages = () => {
    if (socket) {
      socket.off("newMessage");
      socket.off("messagesMarkedSeen");
    }
  };

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [socket, selectedUser, authUser]);

  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    getMessages,
    sendMessage,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
  };

  return (
    <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
  );
};

export default ChatProvider;
