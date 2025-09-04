import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

// 📌 Get all users except the logged-in one + unseen counts
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password"
    );

    const unseenMessages = {};
    const promises = filteredUsers.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });

      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    });
    await Promise.all(promises);

    res.json({ success: true, users: filteredUsers, unseenMessages });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// 📌 Get all messages between logged-in user & selected user
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    // ✅ Mark as seen and get count of updated messages
    const updateResult = await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId, seen: false },
      { seen: true }
    );

    // ✅ Notify sender that their messages have been seen
    if (updateResult.modifiedCount > 0) {
      const senderSocketId = userSocketMap[selectedUserId];
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesMarkedSeen", {
          senderId: myId,
          receiverId: selectedUserId,
          count: updateResult.modifiedCount
        });
      }
    }

    res.json({ success: true, messages });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// 📌 Mark a single message as seen
export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findByIdAndUpdate(
      id, 
      { seen: true }, 
      { new: true }
    );

    // ✅ Notify sender that message has been seen
    if (message) {
      const senderSocketId = userSocketMap[message.senderId];
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesMarkedSeen", {
          senderId: req.user._id,
          receiverId: message.senderId,
          messageId: id
        });
      }
    }

    res.json({ success: true, message: "Message marked as seen" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// 📌 Send a new message
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    console.log("📤 Sending message:", { 
      senderId, 
      receiverId, 
      text: text ? "✓" : "✗", 
      image: image ? "✓" : "✗" 
    });

    let imageUrl;
    if (image) {
      const uploadedImage = await cloudinary.uploader.upload(image);
      imageUrl = uploadedImage.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    console.log("✅ Message created:", newMessage._id);

    // emit via socket.io if receiver online
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
      console.log("🔔 Socket message sent to:", receiverId);
    }

    res.json({ success: true, newMessage: newMessage });
  } catch (error) {
    console.log("❌ Send message error:", error.message);
    res.json({ success: false, message: error.message });
  }
};
