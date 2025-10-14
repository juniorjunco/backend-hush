import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import Order from "../models/Order.js"; // 🛒 Modelo de pedidos (ajústalo a tu esquema)
import Product from "../models/Product.js"; // 🧢 Modelo de productos
import User from "../models/User.js"; // 👤 Modelo de usuarios

dotenv.config();
const router = express.Router();

/**
 * ✅ CONFIRMACIÓN AUTOMÁTICA DE PAGO (Webhook de ePayco)
 * ePayco envía esta solicitud al backend cuando un pago cambia de estado
 */
router.post("/confirmation", async (req, res) => {
  const data = req.body;
  console.log("📥 Confirmación de ePayco recibida:");
  console.log(data);

  try {
    // Validación mínima
    if (!data || !data.x_response) {
      console.log("⚠️ Confirmación vacía o incompleta");
      return res.status(200).send("OK");
    }

    const refPayco = data.x_id_invoice;
    const estado = data.x_response;
    const estadoCodigo = data.x_cod_response; // 1 = Aceptada
    const email = data.x_customer_email;
    const items = JSON.parse(data.x_extra1 || "[]");

    // Manejo del estado de pago
    if (estadoCodigo === "1" || estado === "Aceptada") {
      console.log("💰 Pago aprobado:", refPayco);

      try {
        // 🧾 Buscar pedido por referencia
        const order = await Order.findOne({ invoice: refPayco });

        if (order) {
          order.status = "Pagado";
          await order.save();
          console.log("✅ Pedido actualizado como pagado:", order._id);

          // 📦 Actualizar inventario de productos
          for (const item of items) {
            const product = await Product.findById(item._id);
            if (product) {
              product.sold += item.quantity;
              product.stock = Math.max(product.stock - item.quantity, 0);
              await product.save();
              console.log(`📉 Inventario actualizado para ${product.name}`);
            }
          }

          // 👤 Asociar pedido al usuario
          const user = await User.findOne({ email });
          if (user) {
            user.orders.push(order._id);
            await user.save();
            console.log("👤 Pedido asociado al usuario:", user.email);
          }
        } else {
          console.log("⚠️ Pedido no encontrado para la referencia:", refPayco);
        }
      } catch (err) {
        console.error("❌ Error al actualizar pedido o inventario:", err.message);
      }
    } else if (estado === "Rechazada") {
      console.log("🚫 Pago rechazado:", refPayco);
    } else if (estado === "Abandonada") {
      console.log("⚠️ Pago abandonado por el usuario:", refPayco);
    } else {
      console.log("❓ Estado desconocido:", estado);
    }

    // 🔁 ePayco requiere SIEMPRE una respuesta 200
    res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Error procesando confirmación:", error);
    res.status(200).send("OK");
  }
});

/**
 * ✅ CONSULTA MANUAL DE PAGO (para el frontend)
 * ePayco redirige al usuario a esta ruta con el ref_payco
 */
router.get("/response", async (req, res) => {
  const refPayco = req.query.ref_payco;

  if (!refPayco) {
    return res.status(400).json({ error: "ref_payco es requerido" });
  }

  try {
    const url = `https://secure.epayco.co/validation/v1/reference/${refPayco}`;
    const epaycoResponse = await axios.get(url);
    const data = epaycoResponse.data.data;

    console.log("🔍 Consulta de pago realizada correctamente:", refPayco);
    res.json(data);
  } catch (error) {
    console.error("❌ Error al consultar Epayco:", error.message);
    res.status(500).json({ error: "Error consultando Epayco" });
  }
});

export default router;
