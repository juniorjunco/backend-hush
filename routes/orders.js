import express from "express";
import Order from "../models/Order.js";
import authMiddleware from "../middleware/authMiddleware.js";
import isAdmin from "../middleware/isAdmin.js";

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

    const invoiceNumber = "INV-" + Date.now();

    const newOrder = await Order.create({
      invoice: invoiceNumber,
      user: req.user.userId,
      email: req.user.email,
      items,
      amount: total,
      address,
      status: "Pendiente",
      preferenceId: null,
    });

    res.json(newOrder);
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

export default router;
