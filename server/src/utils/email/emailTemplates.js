import { sendMail } from "./sendMailService.js";

export const sendSignupMail = async (email, verificationToken) => {
  const subject = "Email Verification";
  const verificationLink = `http://localhost:3000/api/v1/auth/verify-signup/${verificationToken}`;
  const templateName = "signup-email";
  const templateData = { verificationLink };

  return sendMail({ email, subject, templateName, templateData });
};

export const sendForgotPasswordMail = async (email, resetToken) => {
  const subject = "Password reset request";
  const resetLink = `http://localhost:3000/api/v1/user/reset-password/${resetToken}`;
  const templateName = "forgot-password-email";
  const templateData = { resetLink };

  return sendMail({ email, subject, templateName, templateData });
};
