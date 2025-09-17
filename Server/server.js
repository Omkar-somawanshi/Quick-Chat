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

// Use a single, clean array for allowed origins
// const allowedOrigins = [

//   process.env.FRONTEND_URL || "http://localhost:5173", // Use environment variable
// ];

// Initialize socket.io with CORS
export const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL, // allow frontend URL
    credentials: true, // allow cookies/auth headers
    methods: ["GET", "POST", "PUT", "DELETE"], // allowed HTTP methods
  },
});

app.use(cors(io));

// Store online users (userId -> Set of socketIds)
export const userSocketMap = new Map();

// Socket.io connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("✅ User Connected:", userId);

  if (userId) {
    if (!userSocketMap.has(userId)) userSocketMap.set(userId, new Set());
    userSocketMap.get(userId).add(socket.id);
  }

  // Emit online users
  io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

  socket.on("disconnect", () => {
    console.log("❌ User Disconnected:", userId);

    if (userId && userSocketMap.has(userId)) {
      userSocketMap.get(userId).delete(socket.id);

      if (userSocketMap.get(userId).size === 0) {
        userSocketMap.delete(userId);
      }
    }

    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
  });
});

// --- Middlewares must be placed before routes ---
app.use(express.json({ limit: "4mb" }));
app.use(cookieParser());

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
    await connectDB(); // connect to DB first
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
