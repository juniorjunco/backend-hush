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
      publicKey: process.env.EPAYCO_PUBLIC_KEY, // ✅ asegúrate de tenerla en Vercel
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
      response: process.env.PAYCO_RESPONSE_URL, // URL de redirección tras el pago
      confirmation: process.env.PAYCO_CONFIRMATION_URL, // URL webhook que hiciste
      email_billing: email,
      extra1: JSON.stringify(items),
      test: process.env.EPAYCO_TEST_MODE === 'true', // true si estás en modo pruebas
    };

    console.log('🔑 Llave pública enviada:', data.publicKey);
    console.log('📦 Datos de pago:', data);

    return res.json({ success: true, data });
  } catch (err) {
    console.error("Error en /create epayco:", err);
    return res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

// ✅ Ruta para recibir la confirmación de pago de ePayco
router.post('/confirmation', async (req, res) => {
  try {
    console.log('✅ Confirmación recibida de ePayco');
    console.log('📦 Datos recibidos:', req.body);

    const data = req.body;

    if (!data || !data.x_response) {
      console.log('⚠️ Datos de confirmación vacíos o incompletos');
      // Responder 200 igual, para que ePayco no repita la confirmación
      return res.status(200).send('OK');
    }

    // Manejo del estado de pago
    switch (data.x_response) {
      case 'Aceptada':
        console.log('💰 Pago aprobado:', data.x_id_invoice);
        // Aquí actualizas el pedido, inventario, usuario, etc.
        break;

      case 'Rechazada':
        console.log('🚫 Pago rechazado');
        break;

      case 'Abandonada':
        console.log('⚠️ Pago abandonado por el usuario');
        break;

      default:
        console.log('❓ Estado desconocido:', data.x_response);
    }

    // ePayco necesita 200 OK SIEMPRE
    res.status(200).send('OK');
  } catch (error) {
    console.error('❌ Error procesando confirmación:', error);
    // Aun si hay error, responder 200 para evitar que ePayco repita la petición
    res.status(200).send('OK');
  }
});



module.exports = router;
