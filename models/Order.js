import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  invoice: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  email: { type: String, required: true },

  items: [orderItemSchema],

  amount: { type: Number, required: true },
  status: { type: String, default: "Pendiente" },
  preferenceId: { type: String },

  // 🔥 DIRECCIÓN CONGELADA DE LA ORDEN
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
  },

  createdAt: { type: Date, default: Date.now },
});



const Order = mongoose.model("Order", orderSchema);
export default Order;
