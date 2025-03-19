import mongoose from "mongoose";
import dotenv from "dotenv";

// .env file load karna
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Failed!");
    console.error(error.message); // Detailed error
    process.exit(1); // Exit process if failed
  }
};


export default connectDB
