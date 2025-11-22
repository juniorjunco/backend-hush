// routes/payments.js
import express from "express";
import dotenv from "dotenv";
import mercadopago from "mercadopago";

dotenv.config();
const router = express.Router();

// 🔹 Configurar Mercado Pago
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

// 🔹 Crear preferencia cuando el usuario haga clic en pagar
router.post("/create_preference", async (req, res) => {
  try {
    const { items, email } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "El carrito no puede estar vacío",
      });
    }

    // Estructura de items para Mercado Pago
    const mpItems = items.map((item) => ({
      title: item.name,
      quantity: item.quantity || 1,
      unit_price: Number(item.price),
      currency_id: "COP",
    }));

    // Crear preferencia
    const preference = {
      items: mpItems,
      payer: {
        email: email || "cliente@correo.com",
      },
      back_urls: {
        success: "https://tudominio.com/payment/success",
        failure: "https://tudominio.com/payment/failure",
        pending: "https://tudominio.com/payment/pending",
      },
      auto_return: "approved",
      binary_mode: true, // solo pagos aprobados
    };

    const response = await mercadopago.preferences.create(preference);

    return res.status(200).json({
      success: true,
      preferenceId: response.body.id,
    });

  } catch (error) {
    console.error("💥 Error Mercado Pago:", error);
    return res.status(500).json({
      success: false,
      message: "Error al procesar el pago",
    });
  }
});

export default router;
