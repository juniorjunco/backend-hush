// routes/mercadopagoWebhook.js
import express from "express";
import axios from "axios";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * 🔔 WEBHOOK MERCADO PAGO
 * Recibe todas las notificaciones automáticas.
 */
router.post("/", async (req, res) => {
  try {
    const data = req.body;

    console.log("📥 Webhook MercadoPago recibido:", JSON.stringify(data, null, 2));

    // Mercado Pago envía payment.id dentro de data.data.id
    const paymentId = data?.data?.id;

    if (!paymentId) {
      console.log("⚠️ Webhook sin payment ID, ignorado.");
      return res.status(200).send("NO PAYMENT ID");
    }

    console.log("🔎 Consultando pago en MercadoPago:", paymentId);

    // Consultar el pago real en Mercado Pago
    const mpResponse = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      }
    );

    const payment = mpResponse.data;

    console.log("📘 Pago consultado - Estado:", payment.status);

    // Buscar pedido por invoice (lo guardaste así en tu Order)
    const order = await Order.findOne({ invoice: paymentId });

    if (!order) {
      console.log("⚠️ No existe un pedido asociado al payment.id:", paymentId);
      return res.status(200).send("ORDER NOT FOUND");
    }

    /** -------------------------------------------------
     * 🟢 SI EL PAGO FUE APROBADO
     * -------------------------------------------------*/
    if (payment.status === "approved") {
      order.status = "Pagado";
      await order.save();

      console.log("💰 Pedido marcado como PAGADO:", order._id);

      // Actualizar inventario y ventas
      for (const item of order.items) {
        const product = await Product.findById(item.productId);

        if (product) {
          product.sold += item.quantity;
          product.stock = Math.max(product.stock - item.quantity, 0);
          await product.save();

          console.log(`📉 Inventario actualizado: ${product.name}`);
        }
      }

      // Asociar pedido al usuario según el email del Order
      const user = await User.findOne({ email: order.email });

      if (user) {
        if (!user.orders.includes(order._id)) {
          user.orders.push(order._id);
          await user.save();
        }
        console.log("👤 Pedido asociado al usuario:", user.email);
      }
    }

    /** -------------------------------------------------
     * 🔴 SI EL PAGO FUE RECHAZADO
     * -------------------------------------------------*/
    else if (payment.status === "rejected") {
      order.status = "Rechazado";
      await order.save();
      console.log("🚫 Pedido RECHAZADO:", order._id);
    }

    /** -------------------------------------------------
     * 🟡 SI EL PAGO ESTÁ PENDIENTE O EN PROCESO
     * -------------------------------------------------*/
    else if (payment.status === "pending" || payment.status === "in_process") {
      order.status = "Pendiente";
      await order.save();
      console.log("⏳ Pedido en estado PENDIENTE:", order._id);
    }

    else {
      console.log("❓ Estado desconocido:", payment.status);
    }

    return res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Error en webhook MercadoPago:", error);
    return res.status(200).send("OK"); // Mercado Pago siempre requiere 200
  }
});

export default router;
