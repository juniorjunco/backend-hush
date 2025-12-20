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

  // 🧱 Render productos (email-safe)
  const itemsHtml = items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 8px; border-bottom:1px solid #eee;">
            <img
              src="${item.image}"
              alt="${item.name}"
              width="80"
              height="80"
              style="
                display:block;
                border-radius:8px;
                object-fit:cover;
                border:1px solid #ddd;
              "
            />
          </td>

          <td style="padding:12px 8px; border-bottom:1px solid #eee;">
            <div style="font-size:14px;">
              <strong>${item.name}</strong><br />
              Talla: ${item.talla}<br />
              Cantidad: ${item.quantity}
            </div>
          </td>

          <td
            align="right"
            style="padding:12px 8px; border-bottom:1px solid #eee; font-size:14px;"
          >
            $${item.price.toLocaleString()}
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
        
        <h2 style="text-align:center;margin-bottom:10px;">
          🚚 Pedido enviado
        </h2>

        <p>
          Tu pedido <strong>${invoice}</strong> ya fue despachado.
        </p>

        <p>
          <strong>Tracking:</strong><br />
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
