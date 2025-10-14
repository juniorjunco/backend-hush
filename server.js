import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/products.js";
import payments from "./routes/payments.js";
import confirmation from "./routes/confirmation.js";

dotenv.config();
const app = express();

// ✅ Configuración CORS
app.use(
  cors({
    origin: [
      "https://hush-sigma.vercel.app", // producción
      "http://localhost:5173",         // desarrollo
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ✅ Middlewares
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Rutas
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/epayco", payments);
app.use("/api/confirmation", confirmation);
app.use("/uploads", express.static("uploads"));

// ✅ Conexión a MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB conectado correctamente");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${process.env.PORT || 5000}`);
    });
  })
  .catch((error) => console.error("❌ Error de conexión:", error));
