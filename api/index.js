import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { config } from "dotenv";

import connectDB from "../config/db.js";
import authRoutes from "../routes/authRoutes.js";
import productRoutes from "../routes/products.js";
import epaycoRoutes from "../routes/epaycoRoutes.js";

config();
connectDB();

const app = express();

// ✅ Configuración CORS correcta
app.use(cors({
  origin: [
    "https://hush-sigma.vercel.app", // frontend producción
    "http://localhost:5173",         // frontend desarrollo (Vite)
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// ✅ Middlewares
app.use(express.json());

// ✅ Rutas
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/epayco", epaycoRoutes);
app.use("/uploads", express.static("uploads"));

// ✅ Exportar handler para Vercel
export default app;
