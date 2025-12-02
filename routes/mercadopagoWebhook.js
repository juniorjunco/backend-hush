import express from "express";
import axios from "axios";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * 🔔 WEBHOOK MERCADO PAGO
 */
router.post("/", async (req, res) => {
  try {
    const data = req.body;

    console.log("📥 Webhook MercadoPago recibido:", JSON.stringify(data, null, 2));

    // Obtener el ID del pago desde diferentes estructuras
    const paymentId =
      data?.data?.id ||
      data?.resource?.split("/").pop() || // fallback cuando envían "resource"
      null;

    if (!paymentId) {
      console.log("⚠️ Webhook sin payment ID");
      return res.status(200).send("NO PAYMENT ID");
    }

    console.log("🔎 Consultando pago:", paymentId);

    // Consultar pago real en Mercado Pago
    const mpResponse = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
      }
    );

    const payment = mpResponse.data;

    console.log("📘 Estado del pago:", payment.status);

    // Obtener preferenceId desde la respuesta
    const preferenceId =
      payment.order?.id || payment.additional_info?.items?.[0]?.id;

    if (!preferenceId) {
      console.log("⚠️ No se encontró preferenceId en el pago");
      return res.status(200).send("NO PREFERENCE ID");
    }

    // Buscar la orden con el mismo preferenceId
    const order = await Order.findOne({ preferenceId });

    if (!order) {
      console.log("⚠️ No existe una orden asociada a preferenceId:", preferenceId);
      return res.status(200).send("ORDER NOT FOUND");
    }

    /** -----------------------------------------
     * 🟢 PAGO APROBADO
     * ----------------------------------------- */
    if (payment.status === "approved") {
      order.status = "Pagado";
      await order.save();

      console.log("💰 Pedido marcado como PAGADO:", order._id);

      // Actualizar inventario
      for (const item of order.items) {
        const productId = item.id || item._id;

        const product = await Product.findById(productId);
        if (product) {
          product.sold += item.quantity;
          product.stock = Math.max(product.stock - item.quantity, 0);
          await product.save();
        }
      }

      // Asociar compra al usuario
      const user = await User.findOne({ email: order.email });

      if (user) {
        if (!user.orders.includes(order._id)) {
          user.orders.push(order._id);
          await user.save();
        }
      }
    }

    /** -----------------------------------------
     * 🔴 RECHAZADO
     * ----------------------------------------- */
    else if (payment.status === "rejected") {
      order.status = "Rechazado";
      await order.save();
    }

    /** -----------------------------------------
     * 🟡 PENDIENTE
     * ----------------------------------------- */
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
