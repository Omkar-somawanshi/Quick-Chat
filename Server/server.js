// import express from 'express';
// // import "dotenv/config";
// import cors from 'cors';
// import http from 'http';
// import { connectDB } from './lib/db.js';
// import userRouter from './routes/userRoutes.js';
// import messageRouter from './routes/messageRoutes.js';
// import { Server } from 'socket.io';
// import cookieParser from "cookie-parser";

// // Create express app and http server
// const app = express();
// const server = http.createServer(app);

// // Initialize socket.io with CORS
// export const io = new Server(server, {
//   cors: {
//     origin: "*",
//   },
// });

// // Store online users
// export const userSocketMap = {}; // { userId: socketId }

// // Socket.io connection handler
// io.on("connection", (socket) => {
//   const userId = socket.handshake.query.userId;
//   console.log("✅ User Connected:", userId);

//   if (userId) userSocketMap[userId] = socket.id;

//   // ✅ Changed from "online-users" to "getOnlineUsers" to match frontend
//   io.emit("getOnlineUsers", Object.keys(userSocketMap));

//   socket.on("disconnect", () => {
//     console.log("❌ User Disconnected:", userId);
//     if (userId) delete userSocketMap[userId];
//     // ✅ Changed from "online-users" to "getOnlineUsers" to match frontend
//     io.emit("getOnlineUsers", Object.keys(userSocketMap));
//   });
// });

// // --- Middlewares must be placed before routes ---
// app.use(express.json({ limit: '4mb' }));
// app.use(cookieParser());
// // Configure the Express CORS middleware. This is the fix for your frontend.
// app.use(cors({
//   origin: "http://localhost:5173", // Replace with your frontend URL
//   credentials: true, // This is crucial for Axios to send headers
// }));

// // Routes
// app.use("/api/status", (req, res) => res.send("Server is live"));
// app.use("/api/auth", userRouter);
// app.use("/api/messages", messageRouter);

// // Function to start server after DB connects
// await connectDB();

// if(process.env.NODE_ENV !== "production"){
//   const  PORT= process.env.PORT || 5000;
//   server.listen(PORT, () => console.log("Server running on PORT:" + PORT));
// }

// export default server;
import express from 'express';
import cors from 'cors';
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
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("❌ User Disconnected:", userId);
    if (userId) delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// --- Middlewares must be placed before routes ---
app.use(express.json({ limit: '4mb' }));
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173", // For local development
  credentials: true, 
}));

// Routes
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Database connection
connectDB();

// Only listen for connections if not in a Vercel environment
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

// Vercel needs to export the app, not listen
export default app;
