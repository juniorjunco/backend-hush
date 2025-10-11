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
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/epayco", epaycoRoutes);
app.use("/uploads", express.static("uploads"));

// Exportar como handler para Vercel
export default app;
