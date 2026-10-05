import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async ({ email, subject, mailgenContent }) => {
  if (!process.env.MAILTRAP_SMTP_HOST || !process.env.MAILTRAP_SMTP_USER || !process.env.MAILTRAP_SMTP_PASS) {
    console.warn("Email credentials are not configured; email was not sent.");
    return;
  }

  const mailGenerator = new Mailgen({
    theme: "default",
    product: { name: "Task Manager", link: process.env.SERVER_URL || "http://localhost:3000" },
  });

  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: Number(process.env.MAILTRAP_SMTP_PORT || 2525),
    auth: { user: process.env.MAILTRAP_SMTP_USER, pass: process.env.MAILTRAP_SMTP_PASS },
  });

  await transporter.sendMail({
    from: "Task Manager <no-reply@example.com>",
    to: email,
    subject,
    text: mailGenerator.generatePlaintext(mailgenContent),
    html: mailGenerator.generate(mailgenContent),
  });
};

const emailVerificationMailgenContent = (username, verificationUrl) => ({
  body: {
    name: username,
    intro: "Welcome! Please verify your email address.",
    action: { instructions: "Click the button below to verify your email.", button: { color: "#22BC66", text: "Verify email", link: verificationUrl } },
    outro: "If you did not create this account, you can ignore this email.",
  },
});

const forgotPasswordMailgenContent = (username, passwordResetUrl) => ({
  body: {
    name: username,
    intro: "We received a request to reset your password.",
    action: { instructions: "Click the button below to reset your password.", button: { color: "#22BC66", text: "Reset password", link: passwordResetUrl } },
    outro: "If you did not request this, you can ignore this email.",
  },
});

export { sendEmail, emailVerificationMailgenContent, forgotPasswordMailgenContent };
