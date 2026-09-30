import { sendEmail, type SendEmailOptions } from ".";
import { VerifyEmail } from "./schemas/verify";

const params: SendEmailOptions = {
  to: "",
  subject: "Verify your email",
  html: VerifyEmail({
    header: "Hello, User!",
    main: "This is your code:",
    otp: "123456",
    footer: "Best regards",
  }),
};

sendEmail(params);
