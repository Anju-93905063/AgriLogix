import mongoose from "mongoose";

export async function connectDB() {
  if (!process.env.MONGODB_URI) {
    console.warn("MONGODB_URI not set, skipping database connection");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
    });
    console.log("MongoDB connected successfully");
  } catch (error: any) {
    console.error("MongoDB connection error:", error.message);
  }
}
