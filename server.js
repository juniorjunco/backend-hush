import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";


import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/products.js";
import payments from "./routes/payments.js";
import confirmation from "./routes/confirmation.js";

// 🔹 Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI;

// 🔹 Middlewares globales
app.use(
  cors({
    origin: [
      "https://hush-sigma.vercel.app", // Producción
      "http://localhost:5173",         // Desarrollo
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/epayco", payments);
app.use("/api/confirmation", confirmation);
app.use("/uploads", express.static("uploads"));

// 🔹 Conexión a MongoDB
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB conectado correctamente");
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch((error) => console.error("❌ Error de conexión:", error));
