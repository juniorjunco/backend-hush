import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { config } from "dotenv";

import connectDB from "../config/db.js";
import authRoutes from "../routes/authRoutes.js";
import productRoutes from "../routes/products.js";
import payments from "../routes/payments.js";
import confirmation from "../routes/confirmation.js"

config();
connectDB();

const app = express();

// ✅ Configuración CORS correcta
app.use(cors({
  origin: [
    "https://hush-sigma.vercel.app", // frontend producción
    "https://admin-hush.vercel.app",
    "http://localhost:5173",         // frontend desarrollo (Vite)
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// ✅ Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// ✅ Rutas
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payments", payments);
app.use("/api/confirmation", confirmation);
app.use("/uploads", express.static("uploads"));

// ✅ Exportar handler para Vercel
export default app;
