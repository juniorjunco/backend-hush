// routes/payments.js
import express from "express";
import { MercadoPagoConfig, Preference } from "mercadopago";

const router = express.Router();

// Inicializar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

// Crear preferencia
router.post("/create_preference", async (req, res) => {
  try {
    const { items, email } = req.body;

    // Validación simple
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No hay productos en el carrito." });
    }

    const preference = await new Preference(client).create({
      body: {
        items: items.map((product) => ({
          id: product.id,
          title: product.name,
          quantity: product.quantity,
          currency_id: "COP",
          unit_price: product.finalPrice,
        })),
        payer: {
          email,
        },
        back_urls: {
          success: `${process.env.FRONTEND_URL}/success`,
          failure: `${process.env.FRONTEND_URL}/failure`,
          pending: `${process.env.FRONTEND_URL}/pending`,
        },
        auto_return: "approved",
      },
    });

    return res.json({ id: preference.id });
  } catch (err) {
    console.error("Error MercadoPago:", err);
    res.status(500).json({ error: "Error al crear la preferencia" });
  }
});

export default router;
