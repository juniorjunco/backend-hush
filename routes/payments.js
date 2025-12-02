// routes/payments.js
import express from "express";
import { MercadoPagoConfig, Preference } from "mercadopago";
import Order from "../models/Order.js";

const router = express.Router();

// Inicializar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

// Crear preferencia
router.post("/create_preference", async (req, res) => {
  try {
    const { items, email, orderId } = req.body;

    // Validación
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No hay productos en el carrito." });
    }
    if (!orderId) {
      return res.status(400).json({ error: "orderId es obligatorio" });
    }

    // Buscar la orden creada antes del checkout
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    // Crear preferencia Mercado Pago
    const preference = await new Preference(client).create({
      body: {
        items: items.map((product) => ({
          id: product.id || product._id,
          title: product.name,
          quantity: product.quantity,
          currency_id: "COP",
          unit_price: Number(product.price),
        })),

        payer: { email },

        back_urls: {
          success: `${process.env.FRONTEND_URL}/success?orderId=${orderId}`,
          failure: `${process.env.FRONTEND_URL}/failure?orderId=${orderId}`,
          pending: `${process.env.FRONTEND_URL}/pending?orderId=${orderId}`,
        },

        auto_return: "approved",
        notification_url: `${process.env.BACKEND_URL}/api/mercadopago/webhook`,
      },
    });

    // Guardar el preference.id dentro de la orden
    order.preferenceId = preference.id;
    await order.save();

    return res.json({ id: preference.id });
  } catch (err) {
    console.error("Error MercadoPago:", err);
    res.status(500).json({ error: "Error al crear la preferencia" });
  }
});

export default router;
