import express from "express";
import axios from "axios";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const data = req.body;

    console.log("📥 Webhook recibido:", JSON.stringify(data, null, 2));

    const paymentId =
      data?.data?.id ||
      data?.resource?.split("/").pop() ||
      null;

    if (!paymentId) return res.status(200).send("NO PAYMENT ID");

    console.log("🔎 Consultando pago:", paymentId);

    const mpResponse = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
      }
    );

    const payment = mpResponse.data;

    console.log("📘 Estado del pago:", payment.status);

    /** -----------------------------------------
     * 🆕 OBTENER orderId DESDE METADATA (correcto)
     * ----------------------------------------- */
    const orderId = payment.metadata?.orderId;

    if (!orderId) {
      console.log("⚠️ No orderId en metadata");
      return res.status(200).send("NO ORDER ID");
    }

    const order = await Order.findById(orderId);

    if (!order) {
      console.log("⚠️ Orden no encontrada");
      return res.status(200).send("ORDER NOT FOUND");
    }

    /** -----------------------------------------
     * 🟢 PAGO APROBADO
     * ----------------------------------------- */
    if (payment.status === "approved") {
      order.status = "Pagado";
      await order.save();

      console.log(`💰 Pedido ${order._id} marcado como PAGADO`);

      // 🔥 Actualizar inventario
      for (const item of order.items) {
        const product = await Product.findById(item._id);
        if (product) {
          product.sold += item.quantity;
          product.stock = Math.max(product.stock - item.quantity, 0);
          await product.save();
        }
      }

      // 👤 Asociar compra al usuario
      const user = await User.findOne({ email: order.email });

      if (user && !user.orders.includes(order._id)) {
        user.orders.push(order._id);
        await user.save();
      }
    }

    /** 🔴 RECHAZADO */
    else if (payment.status === "rejected") {
      order.status = "Rechazado";
      await order.save();
    }

    /** 🟡 PENDIENTE */
    else if (payment.status === "pending" || payment.status === "in_process") {
      order.status = "Pendiente";
      await order.save();
    }

    return res.status(200).send("OK");

  } catch (error) {
    console.error("❌ Error en webhook:", error.message);
    return res.status(200).send("OK");
  }
});

export default router;
