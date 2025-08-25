import express from 'express';
import "dotenv/config";
import cors from 'cors'; // Import the CORS middleware
import http from 'http';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from 'socket.io';
import cookieParser from "cookie-parser";

// Create express app and http server
const app = express();
const server = http.createServer(app);

// Initialize socket.io with CORS
export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Store online users
export const userSocketMap = {}; // { userId: socketId }

// Socket.io connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("✅ User Connected:", userId);

  if (userId) userSocketMap[userId] = socket.id;

  // Emit online users to all clients
  io.emit("online-users", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("❌ User Disconnected:", userId);
    if (userId) delete userSocketMap[userId];
    io.emit("online-users", Object.keys(userSocketMap));
  });
});

// --- Middlewares must be placed before routes ---
app.use(express.json({ limit: '4mb' }));
app.use(cookieParser());
// Configure the Express CORS middleware. This is the fix for your frontend.
app.use(cors({
  origin: "http://localhost:5173", // Replace with your frontend URL
  credentials: true, // This is crucial for Axios to send headers
}));

// Routes
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

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
