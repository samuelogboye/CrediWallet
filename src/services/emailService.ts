import { renderFile } from "ejs";
import { join } from "path";
import { Worker } from "worker_threads";
import { createTransporter } from "../config/emailTransporter";

interface EmailOptions {
  subject: string;
  recipientList: string[];
  message?: string;
  context?: Record<string, any>;
  template?: string;
  attachments?: { filename: string; path: string }[];
}

class EmailService {
  private transporter = createTransporter();

  private async renderTemplate(
    template: string,
    context: Record<string, any>
  ): Promise<string> {
    const templatePath = join(__dirname, "..", "templates", template);
    return new Promise((resolve, reject) => {
      renderFile(templatePath, context, (err, html) => {
        if (err) reject(err);
        resolve(html);
      });
    });
  }

  public async sendEmail({
    subject,
    recipientList,
    message,
    context = {},
    template,
    attachments,
  }: EmailOptions): Promise<void> {
    let htmlContent = "";

    if (template) {
      htmlContent = await this.renderTemplate(template, context);
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientList,
      subject,
      text: message,
      html: htmlContent,
      attachments,
    };

    const worker = new Worker(
      join(__dirname, "..", "..", "dist", "services", "emailWorker.js"),
      {
        workerData: mailOptions,
      }
    );

    worker.on("error", (error) => {
      console.error("Error in email thread:", error);
    });

    worker.on("message", (message) => {
      console.log(message);
    });
  }
}

export default EmailService;
