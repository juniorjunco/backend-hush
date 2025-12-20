import mongoose from "mongoose";
import express from "express";
import Order from "../models/Order.js";
import authMiddleware from "../middleware/authMiddleware.js";
import isAdmin from "../middleware/isAdmin.js";
import { sendShippingEmail } from "../utils/sendEmail.js";

const router = express.Router();

/* ----------------------------------------------------
   🟢 1. CREAR ORDEN PREVIA AL PAGO (USUARIO)
---------------------------------------------------- */
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { items, total, address } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "La orden no tiene productos" });
    }

    if (
      !address ||
      !address.street ||
      !address.city ||
      !address.state ||
      !address.zip ||
      !address.country
    ) {
      return res.status(400).json({ error: "Dirección de envío incompleta" });
    }

    const invoiceNumber = `INV-${Date.now()}`;

    const formattedItems = items.map((item) => {
  if (!mongoose.Types.ObjectId.isValid(item.productId)) {
    throw new Error(`ID de producto inválido: ${item.productId}`);
  }

  return {
    product: item.productId,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    talla: item.talla,
    image: item.image || null, // 👈 NUEVO
  };
});




    const newOrder = await Order.create({
      invoice: invoiceNumber,
      user: req.user.userId,
      email: req.user.email,

      items: formattedItems,
      amount: total,

      shippingAddress: {
        street: address.street,
        city: address.city,
        state: address.state,
        zip: address.zip,
        country: address.country,
      },

      status: "Pendiente",
      preferenceId: null,
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error("❌ Error creando la orden:", error);
    res.status(500).json({ error: "Error creando la orden" });
  }
});

/* ----------------------------------------------------
   🟡 2. PEDIDOS DEL USUARIO AUTENTICADO
---------------------------------------------------- */
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId }).sort({
      createdAt: -1,
    });

    res.json(orders);
  } catch (error) {
    console.error("❌ Error al obtener pedidos:", error);
    res.status(500).json({ error: "Error al obtener pedidos del usuario" });
  }
});

/* ----------------------------------------------------
   🔵 3. CONFIRMAR ORDEN (WEBHOOK / ADMIN)
---------------------------------------------------- */
router.post("/confirm", async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "orderId requerido" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    // 🛑 Evitar reconfirmar
    if (order.status === "Pagado") {
      return res.json({ message: "Orden ya confirmada", order });
    }

    order.status = "Pagado";
    await order.save();

    res.json({
      message: "Orden confirmada como pagada",
      order,
    });
  } catch (error) {
    console.error("❌ Error al confirmar orden:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

/* ----------------------------------------------------
   🔴 4. PEDIDOS PAGADOS + ENVIADOS (ADMIN)
---------------------------------------------------- */
router.get("/admin", authMiddleware, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $in: ["Pagado", "Enviado"] },
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("❌ Error obteniendo pedidos admin:", error);
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
});



/* ----------------------------------------------------
   🚚 5. MARCAR COMO ENVIADO + EMAIL
---------------------------------------------------- */
router.put("/admin/ship/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { trackingNumber } = req.body;

    if (!trackingNumber) {
      return res.status(400).json({ error: "Tracking requerido" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    order.status = "Enviado";
    order.trackingNumber = trackingNumber;
    order.shippedAt = new Date();

    await order.save();

    // 📧 EMAIL CON IMÁGENES
    await sendShippingEmail({
      to: order.email,
      invoice: order.invoice,
      tracking: trackingNumber,
      items: order.items, // 👈 CLAVE
    });

    res.json({
      message: "Pedido enviado correctamente",
      order,
    });
  } catch (error) {
    console.error("❌ Error enviando pedido:", error);
    res.status(500).json({ error: "Error enviando pedido" });
  }
});


export default router;
