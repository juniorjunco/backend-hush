const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');

// Configuración de Multer para imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({ storage: storage });

// Subir múltiples imágenes
router.post('/upload', upload.array('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No se subieron imágenes' });
  }

  const urls = req.files.map(file => `http://localhost:5000/uploads/${file.filename}`);
  res.status(200).json({ success: true, imageUrls: urls });
});

// Obtener todos los productos
router.get('/', async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

// Obtener producto por ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener producto' });
  }
});

// Crear un producto nuevo
router.post('/', async (req, res) => {
  const {
    name,
    price,
    discountPrice,
    imageUrl,
    imageUrls, // 👈 Agregado
    category,
    genero,
    tallas,
    descripcion,
    isNewIn,
    isFeatured
  } = req.body;

  try {
    const newProduct = new Product({
      name,
      price,
      discountPrice,
      imageUrl,
      imageUrls, // 👈 Agregado
      category,
      genero,
      tallas,
      descripcion,
      isNewIn,
      isFeatured
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'No se pudo crear el producto' });
  }
});



// 🆕 EDITAR PRODUCTO por ID
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

// 🆕 ELIMINAR PRODUCTO por ID
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
