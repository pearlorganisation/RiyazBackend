import { sendMail } from "./sendMail.js";

export const sendForgotPasswordMail = (email, resetToken) => {
  const subject = "Password reset request";
  const resetLink = `http://localhost:3000/api/v1/user/reset-password/${resetToken}`; // later on change to ${process.env.CLIENT_URL}
  sendMail(email, resetLink)
    .then(() => {
      return res.status(200).json({
        success: true,
        message:
          "Mail sent successfully. Please check your email, including the spam or junk folder to reset your password.",
        resetLink,
      });
    }) 
    .catch(() => {
      res.status(400).json({
        success: false,
        message: `Unable to send mail! ${error.message}`,
      });
    });
};
