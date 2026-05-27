import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter: nodemailer.Transporter | null = null;

export function isEmailConfigured(): boolean {
  return Boolean(env.smtp.host && env.smtp.user);
}

function getTransporter() {
  if (transporter) return transporter;
  if (!isEmailConfigured()) {
    return null;
  }
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
  });
  return transporter;
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const tx = getTransporter();
  if (!tx) {
    console.log(`[email:dev] To: ${input.to} | ${input.subject}`);
    console.log(input.text ?? input.html);
    return {
      sent: false,
      preview: true,
      detail: "SMTP not configured — email logged to API console only",
    };
  }
  try {
    await tx.sendMail({
      from: env.smtp.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
    return { sent: true, detail: `Email sent to ${input.to}` };
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Email send failed";
    console.error("[email:error]", detail);
    return { sent: false, preview: false, detail };
  }
}

export async function sendWelcomeEmail(to: string, name: string) {
  return sendEmail({
    to,
    subject: "Welcome to MediNova AI",
    html: `<h2>Welcome, ${name}!</h2><p>Your Smart Healthcare Ecosystem account is ready.</p>`,
    text: `Welcome, ${name}! Your MediNova account is ready.`,
  });
}

export async function sendOtpEmail(
  to: string,
  code: string,
  purpose: "verify" | "reset"
) {
  const action = purpose === "reset" ? "reset your password" : "verify your email";
  return sendEmail({
    to,
    subject: `MediNova verification code: ${code}`,
    html: `<p>Your verification code to ${action} is:</p><h1>${code}</h1><p>Expires in 10 minutes.</p>`,
    text: `Your MediNova code: ${code}. Expires in 10 minutes.`,
  });
}

export async function sendAppointmentEmail(
  to: string,
  details: { provider: string; date: string; time: string }
) {
  return sendEmail({
    to,
    subject: "Appointment confirmed — MediNova",
    html: `<p>Your appointment with <strong>${details.provider}</strong> is confirmed for ${details.date} at ${details.time}.</p>`,
  });
}

export async function sendEmergencyEmail(to: string, message: string) {
  return sendEmail({
    to,
    subject: "EMERGENCY ALERT — MediNova",
    html: `<p style="color:red"><strong>Emergency alert triggered:</strong></p><p>${message}</p>`,
  });
}
