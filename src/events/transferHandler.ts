import transferEventEmitter from "./transferEvents";
import EmailService from "../services/emailService";

const emailService = new EmailService();

transferEventEmitter.on("transferMade", async (sender, recipient, amount) => {
  const senderEmailOptions = {
    subject: "Transfer Notification",
    recipientList: [sender.email],
    message: `You have successfully transferred ${amount} to ${
      recipient.name || recipient.email || recipient.account_number
    }.`,
    context: {
      name: sender.name,
      amount,
      recipient: recipient.name || recipient.email || recipient.account_number,
    },
    template: "transferNotificationSender.ejs", // Make sure this template exists
  };

  const recipientEmailOptions = {
    subject: "Transfer Notification",
    recipientList: [recipient.email],
    message: `You have received ${amount} from ${
      sender.name || sender.email || sender.account_number
    }.`,
    context: {
      name: recipient.name,
      amount,
      sender: sender.name || sender.email || sender.account_number,
    },
    template: "transferNotificationRecipient.ejs", // Make sure this template exists
  };

  await emailService.sendEmail(senderEmailOptions);
  await emailService.sendEmail(recipientEmailOptions);
});
