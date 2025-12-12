import mongoose from "mongoose";

const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB conectado en Vercel");
  } catch (err) {
    console.error("Error Mongo:", err);
  }
};

export default connectDB;
