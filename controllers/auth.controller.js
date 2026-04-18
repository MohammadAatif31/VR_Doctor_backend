import User from "../models/user.model.js";
import bcrypt from "bcryptjs"; 
import jwt from "jsonwebtoken" ;
import {
 generateAccessToken,
 generateRefreshToken
} from "../utils/generateToken.js";
import UserProfile from "../models/userProfile.model.js";


// ================= REGISTER =================
export const register = async (req, res) => {
 try {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
   return res.status(400).json({ message: "All fields required" });

  const exist = await User.findOne({ email });
  if (exist)
   return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
   name,
   email,
   password: hashedPassword
  });

  // ⭐ AUTO CREATE PROFILE WITH DEFAULT IMAGE
try {
 await UserProfile.create({
  userId: user._id,
  name: user.name,
  photo: null // ✅ no default image
});
} catch (err) {
  console.log("Profile create error:", err);
}

  // ⭐ AUTO LOGIN AFTER REGISTER
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.cookie("accessToken", accessToken, {
   httpOnly: true,
   secure: true,
   sameSite: "None"
  });

  res.cookie("refreshToken", refreshToken, {
   httpOnly: true,
   secure: true,
   sameSite: "None"
  });

  res.status(201).json({
   message: "Account created & logged in",
   user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
   }
  });

 } catch (err) {
  console.log("REGISTER ERROR:", err);
  res.status(500).json({ error: err.message });
 }
};


// ================= LOGIN =================
// ================= LOGIN =================
export const login = async (req, res) => {

 try {

  const { email, password } = req.body;

  // ================= USER FIND =================
  const user = await User.findOne({ email });

  if (!user)
   return res.status(400).json({
    message: "Invalid credentials"
   });

  // ================= BAN CHECK =================
  if (user.isBanned) {

   return res.status(403).json({
    message: "Your account has been banned by admin"
   });

  }

  // ================= PASSWORD CHECK =================
  const match = await bcrypt.compare(password, user.password);

  if (!match)
   return res.status(400).json({
    message: "Invalid credentials"
   });

  // ================= TOKEN GENERATE =================
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // ================= COOKIE STORE =================
  res.cookie("accessToken", accessToken, {
   httpOnly: true,
   secure: true,
   sameSite: "None"
  });

  res.cookie("refreshToken", refreshToken, {
   httpOnly: true,
   secure: true,
   sameSite: "None"
  });

  // ================= PROFILE FETCH =================
  const profile = await UserProfile.findOne({ userId: user._id });

  // ================= RESPONSE =================
  res.json({
   message: "Login successful",
   user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    photo: profile?.photo
   }
  });

 } catch (err) {

  console.log("LOGIN ERROR:", err);

  res.status(500).json({
   error: err.message
  });

 }

};

// ================= LOGOUT =================
export const logout = (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "None"
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "None"
  });

  res.json({ message: "Logged out" });
};


// ================= REFRESH TOKEN =================
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token)
      return res.status(401).json({ message: "No refresh token" });

    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET
    );

    // ⭐ user database se lao
    const user = await User.findById(decoded.id);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    if(user.isBanned){

return res.status(403).json({
message:"Account banned by admin"
});

}

    const newAccessToken = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true
    });
const profile = await UserProfile.findOne({ userId: user._id });

res.json({
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    photo: profile?.photo  
  }
});

  } catch {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};


// ================= CHANGE PASSWORD =================
export const changePassword = async (req, res) => {
  try {
    const userId = req.user;
    const { newPassword } = req.body;

    if (!newPassword)
      return res.status(400).json({ message: "Password required" });

    const user = await User.findById(userId);

    // prevent same password
    const isSame = await bcrypt.compare(newPassword, user.password);

    if (isSame)
      return res.status(400).json({
        message: "New password must be different"
      });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getMe = async (req, res) => {
  const user = await User.findById(req.user).select("-password");
  res.json(user);
};