// routes/orders.js
import express from "express";
import Order from "../models/Order.js";
import verifyToken from "../middleware/authMiddleware.js"; // si usas middleware JWT

const router = express.Router();

// Obtener pedidos del usuario autenticado
router.get("/my-orders", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    res.status(500).json({ error: "Error al obtener pedidos del usuario" });
  }
});

// Confirmar / actualizar estado de una orden
router.post("/confirm", async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Orden no encontrada" });

    order.status = status;
    await order.save();

    res.json({ message: "Orden actualizada correctamente", order });
  } catch (error) {
    console.error("Error al actualizar orden:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

export default router;
