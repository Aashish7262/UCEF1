import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

export async function connectDB() {
  console.log("MONGODB_URI:", MONGODB_URI);

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is undefined");
  }

  if (mongoose.connection.readyState >= 1) return;

  await mongoose.connect(MONGODB_URI);
}

