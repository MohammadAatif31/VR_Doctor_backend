import jwt from "jsonwebtoken";

// access token (short time)
export const generateAccessToken = (user) => {
 return jwt.sign(
  {
   id: user._id,
   role: user.role
  },
  process.env.JWT_SECRET,
  { expiresIn: "15m" }
 );
};

// refresh token (long time)
export const generateRefreshToken = (user) => {
 return jwt.sign(
  {
   id: user._id,
   role: user.role
  },
  process.env.JWT_REFRESH_SECRET,
  { expiresIn: "7d" }
 );
};