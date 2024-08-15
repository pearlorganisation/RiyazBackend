import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";

export const sendMail = async ({
  email,
  subject,
  templateName,
  templateData,
}) => {
  const __fileName = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__fileName);
  const templatePath = path.join(
    __dirname,
    "../../views/email",
    `${templateName}.ejs`
  );

  const html = await ejs.renderFile(templatePath, {
    resetLink: "http://example.com/reset-password",
  });

  if (typeof html !== "string") {
    throw new Error("Rendered HTML is not a string");
  }
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_EMAIL_USER,
      pass: process.env.NODEMAILER_EMAIL_PASS,
    },
  });

  // Define email options
  let mailOptions = {
    from: process.env.NODEMAILER_EMAIL_USER,
    to: email,
    subject,
    html,
  };

  return new Promise((resolve, reject) => {
    // Send the email using the transporter
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return reject(error);
      } else {
        return resolve("Email Sent Successfully: " + info.response);
      }
    });
  });
};
