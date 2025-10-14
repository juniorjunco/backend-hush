import express from "express";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config();
const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    console.log("📩 Recibiendo solicitud en /payments/create:", req.body);

    const { amount, name, items, email } = req.body;

    if (!amount || !name || !items || !email) {
      console.log("❌ Faltan datos requeridos para el pago");
      return res.status(400).json({
        success: false,
        message: "Faltan datos para el pago",
      });
    }

    const reference = uuidv4();

    const paymentData = {
      key: process.env.EPAYCO_PUBLIC_KEY,
      name: "Compra en Hush",
      description: items.map((i) => i.name).join(", "),
      invoice: reference,
      currency: "COP",
      amount: amount.toString(),
      tax: "0",
      tax_base: "0",
      country: "CO",
      lang: "es",
      external: "false",
      response: process.env.PAYCO_RESPONSE_URL,
      confirmation: process.env.PAYCO_CONFIRMATION_URL,
      email_billing: email,
      extra1: JSON.stringify(items),
      test: process.env.EPAYCO_TEST_MODE === "true",
    };

    console.log("✅ Datos de pago generados:", paymentData);

    return res.status(200).json({
      success: true,
      message: "Datos de pago generados correctamente",
      data: paymentData,
    });
  } catch (error) {
    console.error("💥 Error en /payments/create:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

export default router;
