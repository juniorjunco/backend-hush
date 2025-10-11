// routes/epaycoRoutes.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

router.post('/create', (req, res) => {
  try {
    const { amount, name, items, email } = req.body;

    if (!amount || !name || !items || !email) {
      return res.status(400).json({ success: false, message: "Faltan datos para el pago" });
    }

    const reference = uuidv4();

    const data = {
      publicKey: process.env.EPAYCO_PUBLIC_KEY,
      name,
      description: items.map((i) => i.name).join(', '),
      invoice: reference,
      currency: 'COP',
      amount,
      tax: '0',
      tax_base: '0',
      country: 'CO',
      lang: 'es',
      external: 'false',
      response: process.env.PAYCO_RESPONSE_URL,
      confirmation: process.env.PAYCO_CONFIRMATION_URL,
      email_billing: email,
      extra1: JSON.stringify(items),
      test: process.env.EPAYCO_TEST_MODE === 'true',
    };

    return res.json({ success: true, data });
  } catch (err) {
    console.error("Error en /create epayco:", err);
    return res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

// ✅ Ruta para recibir la confirmación de pago de ePayco
router.post('/confirmation', async (req, res) => {
  try {
    const data = req.body;
    console.log('✅ Confirmación recibida de ePayco:', data);

    // Aquí puedes hacer algo útil, por ejemplo:
    // - Verificar si el pago fue exitoso (x_response == 'Aceptada')
    // - Actualizar el estado del pedido en tu base de datos
    // - Enviar correo o notificación

    // ⚠️ ePayco necesita un status 200 para confirmar que tu backend recibió los datos
    res.status(200).send('OK');
  } catch (error) {
    console.error('❌ Error procesando confirmación:', error);
    res.status(500).send('Error');
  }
});


module.exports = router;
