import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name: String,
  price: Number,
  quantity: Number,
  talla: String,
});

const orderSchema = new mongoose.Schema({
  invoice: { type: String, required: true, unique: true }, 
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  email: { type: String, required: true },
  items: [orderItemSchema],
  amount: { type: Number, required: true },
  status: { type: String, default: "Pendiente" },
  preferenceId: { type: String }, // 🔥 NUEVO
  createdAt: { type: Date, default: Date.now },
});


const Order = mongoose.model("Order", orderSchema);
export default Order;
