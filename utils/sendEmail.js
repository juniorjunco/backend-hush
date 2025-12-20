import nodemailer from "nodemailer";

export const sendShippingEmail = async ({
  to,
  invoice,
  tracking,
  items,
}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 🧮 CÁLCULOS
  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const shippingCost = 9000; // 💸 fijo
  const total = subtotal + shippingCost;

  // 📦 ITEMS
  const itemsHtml = items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 8px;border-bottom:1px solid #eee;">
            <img
              src="${item.image}"
              alt="${item.name}"
              width="80"
              height="80"
              style="display:block;border-radius:8px;object-fit:cover;border:1px solid #ddd;"
            />
          </td>

          <td style="padding:12px 8px;border-bottom:1px solid #eee;">
            <div style="font-size:14px;line-height:1.4;">
              <strong>${item.name}</strong><br/>
              Talla: ${item.talla}<br/>
              Cantidad: ${item.quantity}
            </div>
          </td>

          <td align="right" style="padding:12px 8px;border-bottom:1px solid #eee;font-size:14px;">
            $${(item.price * item.quantity).toLocaleString()}
          </td>
        </tr>
      `
    )
    .join("");

  await transporter.sendMail({
    from: `"HUSH Store" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Tu pedido ${invoice} fue enviado 🚚`,
    html: `
      <div style="max-width:600px;margin:auto;font-family:Arial,sans-serif;color:#000;">

        <!-- 🖤 LOGO -->
        <div style="text-align:center;margin-bottom:20px;">
          <img
            src="https://res.cloudinary.com/dvhmrbwkx/image/upload/v1766257316/logo-negro_mionof.png"
            alt="HUSH"
            width="140"
            style="display:block;margin:auto;"
          />
        </div>

        <h2 style="text-align:center;margin-bottom:10px;">
          Pedido enviado 🚚
        </h2>

        <p>
          Tu pedido <strong>${invoice}</strong> ya fue despachado.
        </p>

        <p>
          <strong>Tracking:</strong><br/>
          <span style="font-family:monospace;font-size:14px;">
            ${tracking}
          </span>
        </p>

        <h3 style="margin-top:30px;margin-bottom:10px;">
          Detalle de tu compra
        </h3>

        <table width="100%" cellspacing="0" cellpadding="0">
          ${itemsHtml}
        </table>

        <!-- 💰 RESUMEN -->
        <table width="100%" cellspacing="0" cellpadding="0" style="margin-top:20px;">
          <tr>
            <td>Subtotal</td>
            <td align="right">$${subtotal.toLocaleString()}</td>
          </tr>
          <tr>
            <td>Envío</td>
            <td align="right">$${shippingCost.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding-top:10px;font-weight:bold;">
              Total
            </td>
            <td align="right" style="padding-top:10px;font-weight:bold;">
              $${total.toLocaleString()}
            </td>
          </tr>
        </table>

        <p style="margin-top:30px;">
          Gracias por comprar en <strong>HUSH</strong> 🖤
        </p>

        <hr style="margin:30px 0;border:none;border-top:1px solid #eee;" />

        <p style="font-size:12px;color:#777;">
          Si tienes dudas sobre tu pedido, responde este correo.
        </p>
      </div>
    `,
  });
};
