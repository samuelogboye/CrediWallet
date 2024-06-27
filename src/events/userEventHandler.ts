import userEventEmitter from "./userEvents";
import EmailService from "../services/emailService";

const emailService = new EmailService();

userEventEmitter.on("userRegistered", async (user) => {
  const emailOptions = {
    subject: "Welcome to Our Service",
    recipientList: [user.email],
    context: { name: user.name },
    template: "registrationNotification.ejs",
  };

  await emailService.sendEmail(emailOptions);
});

userEventEmitter.on("userLoggedIn", async (loginDetails) => {
  const emailOptions = {
    subject: "Login Notification",
    recipientList: [loginDetails.email],
    context: {
      name: loginDetails.name,
      time: loginDetails.time,
      location: loginDetails.location,
      userAgent: loginDetails.userAgent,
      ip: loginDetails.ip,
      browser: loginDetails.browser,
    },
    template: "loginNotification.ejs",
  };

  await emailService.sendEmail(emailOptions);
});
