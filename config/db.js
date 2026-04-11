
import mongoose from "mongoose";

// Database connection

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
   return "⚠️Sorry dear, there is a small issue right now in connecting to the database. Please try again later.";
    // app crash hone se bachane ke liye
    process.exit(1);
  }
};

export default connectDB;






