import jwt from "jsonwebtoken";

export const generateSignupToken = (data) => {
  const token = jwt.sign(data, process.env.JWT_SECRET_KEY, { expiresIn: "1d" }); // Set to min later
  console.log(`token: ${token}`);
  return token;
};
