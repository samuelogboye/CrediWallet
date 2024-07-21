import transferEventEmitter from "./transferEvents";
import EmailService from "../services/emailService";

const emailService = new EmailService();

transferEventEmitter.on("transferMade", async (sender, recipient, amount) => {
  const senderEmailOptions = {
    subject: "CrediWallet Transfer Notification",
    recipientList: [sender.email],
    message: `You money transfer of ₦ ${amount} to ${
      recipient.name || recipient.email || recipient.account_number
    } has been completed.`,
    context: {
      name: sender.name,
      amount,
      recipient: recipient.name || recipient.email || recipient.account_number,
    },
    template: "transferNotificationSender.ejs",
  };

  const recipientEmailOptions = {
    subject: "CrediWallet Transfer Notification",
    recipientList: [recipient.email],
    message: `You have received ${amount} from ${
      sender.name || sender.email || sender.account_number
    }.`,
    context: {
      name: recipient.name,
      amount,
      sender: sender.name || sender.email || sender.account_number,
    },
    template: "transferNotificationRecipient.ejs",
  };

  await emailService.sendEmail(senderEmailOptions);
  await emailService.sendEmail(recipientEmailOptions);
});

transferEventEmitter.on("fund", async (user, amount) => {
  const fundingEmailOptions = {
    subject: "CrediWallet Funding Notification",
    recipientList: [user.email],
    context: {
      name: user.name,
      amount,
    },
    template: "fundingNotification.ejs",
  };

  await emailService.sendEmail(fundingEmailOptions);
});
