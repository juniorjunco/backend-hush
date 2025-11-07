import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    default: "",
  },
});

const tallaSchema = new mongoose.Schema({
  talla: {
    type: String,
    required: true,
  },
  cantidad: {
    type: Number,
    default: 0,
    min: 0,
  },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre del producto es obligatorio"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "El precio es obligatorio"],
      min: 0,
    },
    discountPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Imagen principal
    imageUrl: {
      type: imageSchema,
      default: null,
    },

    // Galería
    imageUrls: {
      type: [imageSchema],
      default: [],
    },

    category: {
      type: String,
      required: [true, "La categoría es obligatoria"],
      enum: ["Ropa", "Zapatos", "Accesorios"],
    },

    // 🔹 Nuevo campo: subcategoría (ej. GORRAS, GAFAS, BOLSOS)
    subCategory: {
      type: String,
      enum: ["GORRAS", "GAFAS", "BOLSOS", "OTROS"],
      default: "OTROS",
    },

    genero: {
      type: String,
      enum: ["Hombre", "Mujer", "Unisex"],
      default: "Unisex",
    },

    tallas: {
      type: [tallaSchema],
      default: [],
    },

    descripcion: {
      type: String,
      trim: true,
      default: "",
    },

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
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
