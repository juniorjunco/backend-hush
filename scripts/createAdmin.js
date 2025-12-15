import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

// 🔥 AQUÍ ESTABA EL PROBLEMA
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI no está definida en .env");
  process.exit(1);
}

await mongoose.connect(MONGODB_URI);

const email = "admin@hush.com";
const password = "Admin123*";

const existingAdmin = await User.findOne({ email });

if (existingAdmin) {
  console.log("⚠️ El admin ya existe");
  process.exit(0);
}

const hashedPassword = await bcrypt.hash(password, 10);

await User.create({
  email,
  password: hashedPassword,
  role: "admin",
});

console.log("✅ Admin creado correctamente");
process.exit(0);
