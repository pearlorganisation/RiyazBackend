import jwt from "jsonwebtoken";

export const generateSignupToken = (data) => {
  const token = jwt.sign(data, process.env.JWT_SECRET_KEY, { expiresIn: "1d" }); // Set 15 minutes or 24 hours
  console.log(`token: ${token}`);
  return token;
};

export const generateForgotPasswordResetToken = (data) => {
  const token = jwt.sign(data, process.env.JWT_SECRET_KEY, {
    expiresIn: "1d", // Set 15 minutes or 1 hour
  });
  return token;
};  
