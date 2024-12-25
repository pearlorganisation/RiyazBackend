import { sendMail } from "./sendMailService.js";

export const sendSignupMail = async (email, verificationToken) => {
  const subject = "Email Verification";
  // Dynamically set BASE_URL based on NODE_ENV
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.PROD_BASE_URL // Production URL
      : process.env.DEV_BASE_URL; // Development URL
  const verificationLink = `${baseUrl}/api/v1/auth/verify-signup/${verificationToken}`;
  const templateName = "signup-email";
  const templateData = { verificationLink };

  return sendMail({ email, subject, templateName, templateData });
};

export const sendForgotPasswordMail = async (email, resetToken, role) => {
  const subject = "Password reset request";
  const resetLink =
    role === "ADMIN"
      ? `${process.env.ADMIN_RESET_PASSWORD_PAGE_URL}/${resetToken}`
      : `${process.env.FRONTEND_RESET_PASSWORD_PAGE_URL}/${resetToken}`;
  const templateName = "forgot-password-email";
  const templateData = { resetLink };

  return sendMail({ email, subject, templateName, templateData });
};
