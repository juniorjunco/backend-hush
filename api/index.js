import express from "express";
import { config } from "dotenv";
import connectDB from "../config/db.js";

import authRoutes from "../routes/authRoutes.js";
import productRoutes from "../routes/products.js";
import payments from "../routes/payments.js";
import mercadopagoWebhook from "../routes/mercadopagoWebhook.js";
import orderRoutes from "../routes/orders.js";

config();

const app = express();

// ⬇️ Conectar DB correctamente en Vercel
await connectDB();

// ⬇️ CORS
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://hush-sigma.vercel.app",
    "https://admin-hush.vercel.app",
    "http://localhost:5173",
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");

  if (req.method === "OPTIONS") return res.status(200).end();

  next();
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/payments", payments);
app.use("/api/orders", orderRoutes);
app.use("/api/mercadopago/webhook", mercadopagoWebhook);

export default app;
