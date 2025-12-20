import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    talla: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);


const orderSchema = new mongoose.Schema(
  {
    // 🧾 FACTURA
    invoice: {
      type: String,
      required: true,
      unique: true,
    },

    // 👤 USUARIO
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    // 📦 PRODUCTOS
    items: {
      type: [orderItemSchema],
      required: true,
    },

    // 💰 TOTAL
    amount: {
      type: Number,
      required: true,
    },

    // 🚚 DIRECCIÓN CONGELADA (CRÍTICO)
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
      country: { type: String, required: true },
    },

    // 📌 ESTADO
    status: {
      type: String,
      enum: ["Pendiente", "Pagado", "Enviado"],
      default: "Pendiente",
      index: true,
    },

    // 📦 ENVÍO
    trackingNumber: {
      type: String,
      default: null,
    },

    shippedAt: {
      type: Date,
      default: null,
    },

    // 💳 MERCADOPAGO
    preferenceId: {
      type: String,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true, // createdAt / updatedAt
  }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
