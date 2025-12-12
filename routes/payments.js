// routes/payments.js
import express from "express";
import { MercadoPagoConfig, Preference } from "mercadopago";
import Order from "../models/Order.js";

const router = express.Router();

// Inicializar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

// Crear preferencia de pago
router.post("/create_preference", async (req, res) => {
  try {
    const { items, email, orderId } = req.body;

    // Validaciones
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No hay productos en el carrito." });
    }
    if (!orderId) {
      return res.status(400).json({ error: "orderId es obligatorio." });
    }

    // Buscar orden creada en checkout
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Orden no encontrada." });
    }

    // Crear preferencia Mercado Pago
   const preference = await new Preference(client).create({
  body: {
    items: items.map((product) => ({
      id: `prod-${product._id}`,
      title: product.name,
      description: product.description || "Producto",
      category_id: "products",
      quantity: product.quantity,
      currency_id: "COP",
      unit_price: Number(product.price),
    })),

    payer: { email },

    shipments: {
      cost: 9000,
      mode: "not_specified",
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


    // Guardar ID de preferencia en la orden
    order.preferenceId = preference.id;
    await order.save();

    return res.json({ id: preference.id });

  } catch (err) {
    console.error("❌ Error MercadoPago:", err);
    res.status(500).json({ error: "Error al crear la preferencia." });
  }
});

export default router;
