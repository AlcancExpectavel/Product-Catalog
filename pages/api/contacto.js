import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const { primeiroNome, ultimoNome, telemovel, email, produto, mensagem } = req.body;

  if (!primeiroNome || !ultimoNome || !telemovel || !produto) {
    return res.status(400).json({ erro: "Campos obrigatórios em falta." });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const dataHora = new Date().toLocaleString("pt-PT", { timeZone: "Europe/Lisbon" });

    await transporter.sendMail({
      from: `"Alcance Expectável — Leads" <${process.env.GMAIL_USER}>`,
      to: "leads.alcance@gmail.com",
      subject: `🛒 Novo lead: ${primeiroNome} ${ultimoNome} — ${produto}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #00C8E0, #0040C8); padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px;">Novo Lead — Alcance Expectável</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px;">${dataHora}</p>
          </div>
          <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #6b7280; font-size: 13px; width: 140px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Nome</td>
                <td style="padding: 10px 0; color: #111827; font-size: 15px; font-weight: 600;">${primeiroNome} ${ultimoNome}</td>
              </tr>
              <tr style="border-top: 1px solid #e5e7eb;">
                <td style="padding: 10px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Telemóvel</td>
                <td style="padding: 10px 0; color: #111827; font-size: 15px;"><a href="tel:${telemovel}" style="color: #0059a0;">${telemovel}</a></td>
              </tr>
              ${email ? `
              <tr style="border-top: 1px solid #e5e7eb;">
                <td style="padding: 10px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Email</td>
                <td style="padding: 10px 0; color: #111827; font-size: 15px;"><a href="mailto:${email}" style="color: #0059a0;">${email}</a></td>
              </tr>` : ""}
              <tr style="border-top: 1px solid #e5e7eb;">
                <td style="padding: 10px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Produto/SKU</td>
                <td style="padding: 10px 0; color: #111827; font-size: 15px; font-weight: 600;">${produto}</td>
              </tr>
              ${mensagem ? `
              <tr style="border-top: 1px solid #e5e7eb;">
                <td style="padding: 10px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; vertical-align: top;">Mensagem</td>
                <td style="padding: 10px 0; color: #111827; font-size: 15px; white-space: pre-line;">${mensagem}</td>
              </tr>` : ""}
            </table>
            <div style="margin-top: 20px; padding: 12px 16px; background: #dbeafe; border-radius: 6px; font-size: 13px; color: #1e40af;">
              💡 Responde a este email ou contacta diretamente pelo telemóvel acima.
            </div>
          </div>
        </div>
      `,
    });

    return res.status(200).json({ sucesso: true });
  } catch (err) {
    console.error("Erro ao enviar email:", err);
    return res.status(500).json({ erro: "Erro ao enviar. Tenta novamente." });
  }
}
