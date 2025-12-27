import mongoose from "mongoose";

export async function connectDB() {
  if (!process.env.MONGODB_URI) {
    console.warn("MONGODB_URI not set, skipping database connection");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    // Don't exit process, just log error so dev server stays up
  }
}
