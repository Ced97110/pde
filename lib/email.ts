import nodemailer from "nodemailer";
import { business } from "@/content/business";

export interface ContactSubmission {
  gite?: string;
  name: string;
  email: string;
  phone?: string;
  dates?: string;
  guests?: number;
  message: string;
}

function getTransport() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error(
      "SMTP_USER and SMTP_APP_PASSWORD must be set (see .env.example) to send contact emails."
    );
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function sendContactEmail(submission: ContactSubmission): Promise<void> {
  const transport = getTransport();

  const lines = [
    submission.gite ? `Gîte : ${submission.gite}` : null,
    `Nom : ${submission.name}`,
    `E-mail : ${submission.email}`,
    submission.phone ? `Téléphone : ${submission.phone}` : null,
    submission.dates ? `Dates souhaitées : ${submission.dates}` : null,
    submission.guests ? `Nombre de personnes : ${submission.guests}` : null,
    "",
    submission.message,
  ].filter((line): line is string => line !== null);

  await transport.sendMail({
    from: process.env.SMTP_USER,
    to: business.contact.email,
    replyTo: submission.email,
    subject: `Nouvelle demande de contact — ${submission.name}`,
    text: lines.join("\n"),
  });
}
