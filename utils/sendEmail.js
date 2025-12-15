import nodemailer from "nodemailer";

export const sendShippingEmail = async ({ to, invoice, tracking }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"HUSH Store" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Tu pedido fue enviado 🚚",
    html: `
      <h2>Pedido enviado</h2>
      <p>Tu pedido <b>${invoice}</b> ya fue despachado.</p>
      <p><b>Tracking:</b> ${tracking}</p>
      <p>Gracias por comprar en HUSH 🖤</p>
    `,
  });
};
