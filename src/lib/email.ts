
import { lookup } from "node:dns/promises";
import type { LookupAddress } from "node:dns";
import { createConnection } from "node:net";
import { connect as createTlsConnection } from "node:tls";
import { createTransport } from "nodemailer";

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

function testTcpConnection(
  address: string,
  family: number,
  port: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const socket = createConnection({
      host: address,
      port,
      family,
    });

    socket.setTimeout(7000);

    socket.once("connect", () => {
      socket.destroy();
      resolve("TCP connection successful");
    });

    socket.once("timeout", () => {
      socket.destroy();
      reject(new Error("TCP connection timed out"));
    });

    socket.once("error", (error) => {
      socket.destroy();
      reject(error);
    });
  });
}

function testTlsConnection(
  address: string,
  family: number,
  host: string,
  port: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const socket = createTlsConnection({
  host: address,
  port,
  servername: host,
  rejectUnauthorized: true,
});

    socket.setTimeout(7000);

    socket.once("secureConnect", () => {
      socket.destroy();
      resolve("TLS handshake successful");
    });

    socket.once("timeout", () => {
      socket.destroy();
      reject(new Error("TLS handshake timed out"));
    });

    socket.once("error", (error) => {
      socket.destroy();
      reject(error);
    });
  });
}

async function diagnoseSmtp(host: string, port: number) {
  console.log("[SMTP DIAGNOSTICS] Starting production diagnostics.");
  console.log("[SMTP DIAGNOSTICS] Host:", host);
  console.log("[SMTP DIAGNOSTICS] Port:", port);

  let addresses: LookupAddress[];

  try {
    addresses = await lookup(host, {
      all: true,
      verbatim: true,
    });

    console.log("[SMTP DIAGNOSTICS] DNS successful:", addresses);
  } catch (error) {
    console.error("[SMTP DIAGNOSTICS] DNS FAILED:", error);
    return;
  }

  if (addresses.length === 0) {
    console.error("[SMTP DIAGNOSTICS] DNS returned no addresses.");
    return;
  }

  for (const address of addresses) {
    console.log(
      `[SMTP DIAGNOSTICS] Testing ${address.address} (IPv${address.family})`,
    );

    try {
      await testTcpConnection(
        address.address,
        address.family,
        port,
      );

      console.log(
        `[SMTP DIAGNOSTICS] TCP SUCCESS: ${address.address}`,
      );
    } catch (error) {
      console.error(
        `[SMTP DIAGNOSTICS] TCP FAILED: ${address.address}`,
        error,
      );

      continue;
    }

    try {
      await testTlsConnection(
        address.address,
        address.family,
        host,
        port,
      );

      console.log(
        `[SMTP DIAGNOSTICS] TLS SUCCESS: ${address.address}`,
      );
    } catch (error) {
      console.error(
        `[SMTP DIAGNOSTICS] TLS FAILED: ${address.address}`,
        error,
      );
    }
  }

  console.log("[SMTP DIAGNOSTICS] Diagnostics completed.");
}

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

  if (
    process.env.VERCEL === "1" &&
    process.env.SMTP_DIAGNOSTICS === "true"
  ) {
    await diagnoseSmtp(host, port);
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
  } catch (error) {
    console.error("[EMAIL] SMTP SEND FAILED:", error);
    throw error;
  } finally {
    transporter.close();
  }
}
