import { sendMail } from "./sendMailService.js";

export const sendForgotPasswordMail = async (email, resetToken) => {
  const subject = "Password reset request";
  //Following link should be the link of the frontend page responsible to request password reset. For now it is a direct endpoint to reset password
  const resetLink = `http://localhost:3000/api/v1/user/reset-password/${resetToken}`; // later on change to ${process.env.FORGOT_PASSWORD_REDIRECT_URL}
  const templateName = "forgot-password-email";
  const templateData = { resetLink };

  return sendMail({ email, subject, templateName, templateData });
};

export const sendSignupMail = async (email, verificationToken) => {
  const subject = "Email Verification";
  const verificationLink = `http://localhost:3000/api/v1/auth/verify-signup/${verificationToken}`; // later on change to ${process.env.CLIENT_URL}
  const templateName = "signup-email";
  const templateData = { verificationLink };

  return sendMail({ email, subject, templateName, templateData });
};
