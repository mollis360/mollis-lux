
import { createTransport } from "nodemailer";

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: SendEmailInput) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!host || !port || !user || !password) {
    throw new Error("SMTP environment variables are missing.");
  }

  const transporter = createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass: password,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });

  try {
    const result = await transporter.sendMail({
      from: `MOLLIS LUX <${user}>`,
      to,
      subject,
      text,
      ...(html ? { html } : {}),
    });

    console.log("[EMAIL] Message accepted:", result.messageId);

    return result;
  } finally {
    transporter.close();
  }
}
