import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    invoice: String,

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    email: String,

    items: [
      {
        name: String,
        price: Number,
        quantity: Number,
        talla: String,
      },
    ],

    amount: Number,

    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },

    status: {
      type: String,
      enum: ["Pendiente", "Pagado", "Enviado", "Cancelado"],
      default: "Pendiente",
    },

    trackingNumber: {
      type: String,
      default: null,
    },

    shippedAt: {
      type: Date,
      default: null,
    },

    preferenceId: String,
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
