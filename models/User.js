import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      match: /.+\@.+\..+/,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    name: String,
    lastName: String,
    document: String,
    gender: String,
    birthdate: Date,

    phone: {
      type: String,
      match: /^[0-9\-\+]{9,15}$/,
    },

    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },

    /** 🆕 PEDIDOS DEL USUARIO */
    orders: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Order",
      default: [], // ← ESTO evita el error del webhook
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
