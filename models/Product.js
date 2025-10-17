import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  name: { type: String, default: "" }, // nombre personalizado para la imagen
});

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  discountPrice: Number,

  // Imagen principal con nombre
  imageUrl: {
    type: imageSchema,
    default: null,
  },

  // Galería de imágenes
  imageUrls: {
    type: [imageSchema],
    default: [],
  },

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

const Product = mongoose.model("Product", productSchema);
export default Product;
