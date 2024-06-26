import { parentPort, workerData } from "worker_threads";
import { createTransporter } from "../config/emailTransporter";

async function sendEmail() {
  const transporter = createTransporter();

  try {
    await transporter.sendMail(workerData);
    parentPort?.postMessage("Email sent successfully");
  } catch (error) {
    parentPort?.postMessage(`Error sending email: ${(error as Error).message}`);
  }
}

sendEmail();
