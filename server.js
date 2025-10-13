require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/products');
const epaycoRoutes = require('./routes/epaycoRoutes');

const app = express();

// ✅ Configuración CORS correcta
app.use(cors({
  origin: [
    "https://hush-sigma.vercel.app", // frontend en producción
    "http://localhost:5173",         // frontend en desarrollo (Vite)
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// ✅ Middlewares
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Rutas
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/epayco', epaycoRoutes);
app.use('/uploads', express.static('uploads'));

// ✅ Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ MongoDB conectado correctamente');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${process.env.PORT || 5000}`);
    });
  })
  .catch((error) => console.error('❌ Error de conexión:', error));
