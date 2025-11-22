// routes/payments.js
import express from "express";
import dotenv from "dotenv";
import MercadoPagoConfig, { Preference } from "mercadopago";
import { v4 as uuidv4 } from "uuid";

dotenv.config();
const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    console.log("📩 Recibiendo solicitud en /payments/create:", req.body);

    const { amount, name, items, email } = req.body;

    if (!amount || !name || !items || !email) {
      return res.status(400).json({ success: false, message: "Faltan datos para el pago" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Carrito inválido" });
    }

    // Crear instancia del cliente MP
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    });

    const reference = uuidv4();

    // Crear preferencia
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: items.map((p) => ({
          title: p.name,
          quantity: p.quantity,
          unit_price: Number(p.price),
          currency_id: "COP",
        })),
        payer: {
          email,
        },
        external_reference: reference,
        back_urls: {
          success: process.env.MP_SUCCESS_URL,
          failure: process.env.MP_FAILURE_URL,
          pending: process.env.MP_PENDING_URL,
        },
        auto_return: "approved",
      },
    });

    console.log("🧾 Preferencia creada:", result);

    return res.status(200).json({
      success: true,
      id: result.id,  // ID de la preferencia (para frontend)
      init_point: result.init_point, // URL para redirigir
    });

  } catch (error) {
    console.error("💥 Error en /payments/create:", error);
    return res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

export default router;
