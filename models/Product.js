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

    // 🔹 Subcategoría o tipo específico de accesorio
subCategory: {
  type: String,
  enum: [
    // ROPA
    "OVERSIZED",
    "BASICOS",
    "TANK",
    "BUZOS",

    // ACCESORIOS
    "GORRAS",
    "GAFAS",
    "BOLSOS",

    // GENERAL
    "OTROS",
  ],
  default: "OTROS",
},


    // 🔹 Género
    genero: {
      type: String,
      enum: ["Hombre", "Mujer", "Unisex"],
      default: "Unisex",
    },

    // 🔹 Filtro visual (OVERSIZE, BÁSICOS, TANK, BUZOS, etc.)
   filtro: {
  type: String,
  enum: [
    "OVERSIZED",
    "BASICOS",
    "TANK",
    "BUZOS",
    "TODOS",
  ],
  default: "TODOS",
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
