import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";

// Create express app and http server
const app = express();
const server = http.createServer(app);

// --- Middlewares ---
app.use(express.json({ limit: "4mb" }));
app.use(cookieParser());

// Proper CORS setup for Express
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Socket.IO setup
export const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Store online users (userId -> Set of socketIds)
export const userSocketMap = new Map();

// Socket.IO connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.auth.userId;
  console.log("✅ User Connected:", userId);

  if (userId) {
    if (!userSocketMap.has(userId)) userSocketMap.set(userId, new Set());
    userSocketMap.get(userId).add(socket.id);
  }

  // Emit online users
  io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

  // --------------------
  // VIDEO CALL EVENTS
  // --------------------

  // Caller sends an offer to callee
  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    const calleeSockets = userSocketMap.get(userToCall);
    if (calleeSockets) {
      calleeSockets.forEach((socketId) => {
        io.to(socketId).emit("receiveCall", { signal: signalData, from, name });
      });
    }
  });

  // Callee answers the call
  socket.on("answerCall", ({ to, signal }) => {
    const callerSockets = userSocketMap.get(to);
    if (callerSockets) {
      callerSockets.forEach((socketId) => {
        io.to(socketId).emit("callAccepted", signal);
      });
    }
  });

  // Handle call rejection
  socket.on("rejectCall", ({ to }) => {
    const callerSockets = userSocketMap.get(to);
    if (callerSockets) {
      callerSockets.forEach((socketId) => {
        io.to(socketId).emit("callRejected");
      });
    }
  });

  // End a call
  socket.on("endCall", ({ to }) => {
    const otherSockets = userSocketMap.get(to);
    if (otherSockets) {
      otherSockets.forEach((socketId) => {
        io.to(socketId).emit("callEnded");
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User Disconnected:", userId);

    if (userId && userSocketMap.has(userId)) {
      userSocketMap.get(userId).delete(socket.id);
      if (userSocketMap.get(userId).size === 0) userSocketMap.delete(userId);
    }

    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
  });
});

// Routes
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

app.get("/", (req, res) => {
  res.send("✅ Quick Chat Backend is Live!");
});

// Function to start server after DB connects
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () =>
      console.log(`🚀 Server is running on port: ${PORT}`)
    );
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
export default server;
