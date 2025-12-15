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

    if (!address) {
      return res.status(400).json({ error: "Dirección de envío requerida" });
    }

    const invoiceNumber = "INV-" + Date.now();

    const newOrder = await Order.create({
      invoice: invoiceNumber,
      user: req.user.userId,
      email: req.user.email,

      items,
      amount: total,

      // 🔥 Dirección REAL del envío (congelada en la orden)
      shippingAddress: {
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        zip: address.zip || "",
        country: address.country || "",
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
    const orders = await Order.find({
      user: req.user.userId,
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("❌ Error al obtener pedidos:", error);
    res
      .status(500)
      .json({ error: "Error al obtener pedidos del usuario" });
  }
});

/* ----------------------------------------------------
   🔵 3. CONFIRMAR / ACTUALIZAR ORDEN (WEBHOOK / ADMIN)
   ---------------------------------------------------- */
router.post("/confirm", async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    order.status = status;
    await order.save();

    res.json({
      message: "Orden actualizada correctamente",
      order,
    });
  } catch (error) {
    console.error("❌ Error al actualizar orden:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

/* ----------------------------------------------------
   🔴 4. TODOS LOS PEDIDOS PAGADOS (ADMIN)
   ---------------------------------------------------- */
router.get(
  "/admin",
  authMiddleware,
  isAdmin,
  async (req, res) => {
    try {
      const orders = await Order.find({ status: "Pagado" })
        .populate("user", "email name")
        .sort({ createdAt: -1 });

      res.json(orders);
    } catch (error) {
      console.error("❌ Error obteniendo pedidos admin:", error);
      res.status(500).json({ error: "Error al obtener pedidos" });
    }
  }
);

router.put(
  "/admin/ship/:id",
  authMiddleware,
  isAdmin,
  async (req, res) => {
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

      // 📧 Email automático
      await sendShippingEmail({
        to: order.email,
        invoice: order.invoice,
        tracking: trackingNumber,
      });

      res.json({ message: "Pedido enviado correctamente", order });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error enviando pedido" });
    }
  }
);

export default router;
