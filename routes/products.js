import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import Product from "../models/Product.js";

const router = express.Router();

/* ============================================================
   ⚙️ CONFIGURACIÓN DE CLOUDINARY
   ============================================================ */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ============================================================
   ⚙️ CONFIGURACIÓN DE MULTER + CLOUDINARY
   ============================================================ */
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});
const upload = multer({ storage });

/* ============================================================
   🔹 SUBIDA DE IMÁGENES (uso opcional)
   ============================================================ */
router.post("/upload", upload.array("images", 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No se subieron imágenes" });
  }

  const urls = req.files.map((file) => file.path);
  res.status(200).json({ success: true, imageUrls: urls });
});

/* ============================================================
   🔹 OBTENER TODOS LOS PRODUCTOS
   ============================================================ */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("Error al obtener productos:", err);
    res.status(500).json({ message: "Error al obtener productos" });
  }
});

/* ============================================================
   🔹 OBTENER PRODUCTO POR ID
   ============================================================ */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Producto no encontrado" });
    res.json(product);
  } catch (err) {
    console.error("Error al obtener producto:", err);
    res.status(500).json({ message: "Error al obtener producto" });
  }
});

/* ============================================================
   🔹 CREAR PRODUCTO (con imagen y datos)
   ============================================================ */
router.post("/", upload.array("images", 5), async (req, res) => {
  try {
    // Campos de texto enviados en el FormData
    let {
      name,
      price,
      discountPrice,
      category,
      genero,
      tallas,
      descripcion,
      isNewIn,
      isFeatured,
    } = req.body;

    // Parseo de tallas si vienen como string
    if (tallas && typeof tallas === "string") {
      try {
        tallas = JSON.parse(tallas);
      } catch {
        tallas = [];
      }
    }

    // Procesar imágenes subidas a Cloudinary
    const imageUrls = req.files?.map((file) => ({
      url: file.path,
      name: file.originalname,
    })) || [];

    const imageUrl = imageUrls.length > 0 ? imageUrls[0] : null;

    // Crear el nuevo producto
    const newProduct = new Product({
      name,
      price,
      discountPrice,
      imageUrl,
      imageUrls,
      category,
      genero,
      tallas,
      descripcion,
      isNewIn: isNewIn === "true" || isNewIn === true,
      isFeatured: isFeatured === "true" || isFeatured === true,
    });

    await newProduct.save();
    res.status(201).json({ success: true, product: newProduct });
  } catch (error) {
    console.error("❌ Error al crear producto:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});

/* ============================================================
   🔹 EDITAR PRODUCTO
   ============================================================ */
router.put("/:id", upload.array("images", 5), async (req, res) => {
  try {
    let updateData = { ...req.body };

    // Parseo de tallas si vienen como string
    if (updateData.tallas && typeof updateData.tallas === "string") {
      try {
        updateData.tallas = JSON.parse(updateData.tallas);
      } catch {
        updateData.tallas = [];
      }
    }

    // Si se envían nuevas imágenes
    if (req.files && req.files.length > 0) {
      updateData.imageUrls = req.files.map((file) => ({
        url: file.path,
        name: file.originalname,
      }));
      updateData.imageUrl = updateData.imageUrls[0];
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error("❌ Error al actualizar producto:", error);
    res.status(500).json({ success: false, message: "Error al actualizar producto" });
  }
});

/* ============================================================
   🔹 ELIMINAR PRODUCTO
   ============================================================ */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json({ success: true, message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar producto:", error);
    res.status(500).json({ message: "Error al eliminar producto" });
  }
});

export default router;
