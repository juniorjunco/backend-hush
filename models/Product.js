const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  discountPrice: Number,
  imageUrl: String, // Imagen principal (se mantiene por compatibilidad)
  imageUrls: [String], // ⬅️ NUEVO: array de imágenes adicionales
  category: String,
  genero: String,
  tallas: [
    {
      talla: String,
      cantidad: Number,
    },
  ],
  descripcion: String,
  isNewIn: {
    type: Boolean,
    default: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', productSchema);
