import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
  const token = jwt.sign(
    { userId }, // payload
    process.env.JWT_SECRET, // secret key
    { expiresIn: "7d" } // optional: token expires in 7 days
  );
  return token;
};
