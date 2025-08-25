const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// ⚡ Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ⚡ Configuración de Multer con Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products', // Carpeta en tu Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

const upload = multer({ storage });

/* ============================================================
   🔹 SUBIDA DE IMÁGENES A CLOUDINARY (opcional desde backend)
   ============================================================ */
router.post('/upload', upload.array('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: 'No se subieron imágenes' });
  }

  // Cloudinary devuelve `path` (que es el `secure_url`)
  const urls = req.files.map((file) => file.path);

  res.status(200).json({ success: true, imageUrls: urls });
});

/* ============================================================
   🔹 OBTENER PRODUCTOS
   ============================================================ */
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(product);
  } catch (err) {
    console.error('Error al obtener producto:', err);
    res.status(500).json({ message: 'Error al obtener producto' });
  }
});

/* ============================================================
   🔹 CREAR PRODUCTO
   ============================================================ */
router.post('/', async (req, res) => {
  try {
    let {
      name,
      price,
      discountPrice,
      imageUrl,
      imageUrls,
      category,
      genero,
      tallas,
      descripcion,
      isNewIn,
      isFeatured,
    } = req.body;

    // 🛠 Asegurar que imageUrls sea un array
    if (typeof imageUrls === 'string') {
      try {
        imageUrls = JSON.parse(imageUrls); // Si viene como JSON string
      } catch {
        imageUrls = [imageUrls]; // Si es un string plano
      }
    }

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
      isNewIn,
      isFeatured,
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(400).json({ error: 'No se pudo crear el producto' });
  }
});

/* ============================================================
   🔹 EDITAR PRODUCTO
   ============================================================ */
router.put('/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
});

/* ============================================================
   🔹 ELIMINAR PRODUCTO
   ============================================================ */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({ success: true, message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
});

module.exports = router;
