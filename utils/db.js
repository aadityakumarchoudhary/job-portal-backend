import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    throw error; // ✅ lets index.js catch it and stop the server
  }
};

export default connectDB;