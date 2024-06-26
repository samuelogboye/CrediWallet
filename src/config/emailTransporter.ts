import nodemailer, { Transporter } from "nodemailer";
import { SentMessageInfo } from "nodemailer";

// Ensure the necessary environment variables are set up
import dotenv from "dotenv";
dotenv.config();

export const createTransporter = (): Transporter<SentMessageInfo> => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};
