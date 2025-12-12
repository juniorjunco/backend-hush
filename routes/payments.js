// routes/payments.js
import express from "express";
import { MercadoPagoConfig, Preference } from "mercadopago";
import Order from "../models/Order.js";

const router = express.Router();

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

router.post("/create_preference", async (req, res) => {
  try {
    const { items, email, orderId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No hay productos en el carrito." });
    }

    if (!orderId) {
      return res.status(400).json({ error: "orderId es obligatorio." });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Orden no encontrada." });
    }

    // Agregar el costo de envío como ítem adicional
    const shippingItem = {
      title: "Costo de envío",
      quantity: 1,
      currency_id: "COP",
      unit_price: 9000,
    };

    const preference = await new Preference(client).create({
      body: {
        items: [
          ...items.map((product) => ({
            id: `prod-${product._id}`,
            title: product.name,
            description: product.description || "Producto",
            quantity: product.quantity,
            currency_id: "COP",
            unit_price: Number(product.price),
          })),
          shippingItem, // 👈 Agregado correctamente
        ],

        payer: { email },

        payment_methods: {
          installments: 1,
          excluded_payment_types: [{ id: "ticket" }],
        },

        back_urls: {
          success: `${process.env.FRONTEND_URL}/success?orderId=${orderId}`,
          failure: `${process.env.FRONTEND_URL}/failure?orderId=${orderId}`,
          pending: `${process.env.FRONTEND_URL}/pending?orderId=${orderId}`,
        },

        auto_return: "approved",

        notification_url: `${process.env.BACKEND_URL}/api/mercadopago/webhook`,
      },
    });

    // ⛔ CORRECCIÓN CRÍTICA AQUÍ
    order.preferenceId = preference.body.id;
    await order.save();

    return res.json({ id: preference.body.id });

  } catch (err) {
    console.error("❌ Error MercadoPago:", err);
    res.status(500).json({ error: "Error al crear la preferencia." });
  }
});

export default router;
