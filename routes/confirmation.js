import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

dotenv.config();
const router = express.Router();

router.post("/", async (req, res) => {
  const data = req.body;
  console.log("📥 Confirmación de ePayco recibida:");
  console.log(data);

  try {
    if (!data || !data.x_response) {
      console.log("⚠️ Confirmación vacía o incompleta");
      return res.status(200).send("OK");
    }

    const refPayco = data.x_id_invoice;
    const estado = data.x_response;
    const estadoCodigo = data.x_cod_response;
    const email = data.x_customer_email;
    const items = JSON.parse(data.x_extra1 || "[]");

    if (estadoCodigo === "1" || estado === "Aceptada") {
      console.log("💰 Pago aprobado:", refPayco);

      try {
        const order = await Order.findOne({ invoice: refPayco });

        if (order) {
          order.status = "Pagado";
          await order.save();
          console.log("✅ Pedido actualizado como pagado:", order._id);

          for (const item of items) {
            const product = await Product.findById(item._id);
            if (product) {
              product.sold += item.quantity;
              product.stock = Math.max(product.stock - item.quantity, 0);
              await product.save();
              console.log(`📉 Inventario actualizado para ${product.name}`);
            }
          }

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

    res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Error procesando confirmación:", error);
    res.status(200).send("OK");
  }
});

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
