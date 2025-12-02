// routes/orders.js
import express from "express";
import Order from "../models/Order.js";
import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();

/* ----------------------------------------------------
   🟢 1. CREAR ORDEN PREVIA AL PAGO (OBLIGATORIO)
   ---------------------------------------------------- */
router.post("/create", verifyToken, async (req, res) => {
  try {
    const { items, total, address } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No hay productos en la orden" });
    }

    // 🔹 Generar número de factura único
    const invoiceNumber = "INV-" + Date.now();

    const newOrder = await Order.create({
      invoice: invoiceNumber,       // requerido
      user: req.user.id,            // ID del usuario
      email: req.user.email,        // requerido
      items,
      amount: total,                // requerido (antes mandabas "total")
      status: "Pendiente",
      preferenceId: null,
      address                       // opcional
    });

    res.json(newOrder);
  } catch (error) {
    console.error("❌ Error creando la orden:", error);
    res.status(500).json({ error: "Error creando la orden" });
  }
});


/* ----------------------------------------------------
   🟡 2. OBTENER LOS PEDIDOS DEL USUARIO AUTENTICADO
   ---------------------------------------------------- */
router.get("/my-orders", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("❌ Error al obtener pedidos:", error);
    res.status(500).json({ error: "Error al obtener pedidos del usuario" });
  }
});

/* ----------------------------------------------------
   🔵 3. ACTUALIZAR ESTADO DE LA ORDEN (ADMIN / WEBHOOK)
   ---------------------------------------------------- */
router.post("/confirm", async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Orden no encontrada" });

    order.status = status;
    await order.save();

    res.json({ message: "Orden actualizada correctamente", order });
  } catch (error) {
    console.error("❌ Error al actualizar orden:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

export default router;
