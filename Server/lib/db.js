import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    // Use DB name from env if not appended in URI
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
    const dbName = "quickchat";

    await mongoose.connect(uri, {
      dbName, // safer than appending to URI manually
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB connected successfully");

    // Optional: Extra listeners
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
    });

  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error.message);
    process.exit(1); // Exit app if DB connection fails
  }
};
