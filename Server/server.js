import express from 'express';
import "dotenv/config";
import cors from 'cors';
import http from 'http';
import { connectDB } from './lib/db.js';  // don’t forget `.js` extension in ESM

// Create express app and http server
const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json({ limit: '4mb' }));
app.use(cors());

// Simple route
app.use("/api/status", (req, res) => res.send("Server is live"));

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
