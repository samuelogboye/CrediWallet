import path from "path";
import statementEventEmitter from "./statementEvents";
import EmailService from "../services/emailService";

const emailService = new EmailService();

statementEventEmitter.on("statement", async (user, from, to, filePath) => {
  const statementEmailOptions = {
    subject: "CrediWallet Your Account Statement",
    recipientList: [user.email],
    context: {
      name: user.name,
      from,
      to,
    },
    attachments: [
      {
        filename: path.basename(filePath),
        path: filePath,
      },
    ],
    template: "statementEmail.ejs",
  };
  await emailService.sendEmail(statementEmailOptions);
});
