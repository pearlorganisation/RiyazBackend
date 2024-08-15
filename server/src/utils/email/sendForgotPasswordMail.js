import { sendMail } from "./sendMail.js";

export const sendForgotPasswordMail = async (email, resetToken) => {
  const subject = "Password reset request";

  const resetLink = `http://localhost:3000/api/v1/user/reset-password/${resetToken}`; // later on change to ${process.env.CLIENT_URL}
  //console.log("-----", resetLink);
  const templateName = "forgot-password";
  const templateData = { resetLink };

  return sendMail({ email, subject, templateName, templateData });
};
