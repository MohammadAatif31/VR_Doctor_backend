import express from "express";
import { register, login, logout, refreshToken, changePassword, getMe }
 from "../controllers/auth.controller.js";
import { protect} from "../middleware/auth.middleware.js";
import passport from "../config/passport.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";

const router = express.Router();

 
// no need to protect routes-//
router.post("/register", register);
router.post("/login", login);
router.get("/refresh", refreshToken)
//---yes protect the routes--//  
router.post("/logout",protect, logout);
router.post("/change-password", protect, changePassword)
router.get("/me", protect, getMe);
// ===============================
// 🔥 GOOGLE LOGIN
// ===============================
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// ===============================
// 🔥 GOOGLE CALLBACK
// ===============================
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    try {
      const user = req.user;

      // ❌ banned user block
      if (user.isBanned) {
        return res.redirect("http://localhost:5173/login");
      }

      // ✅ SAME TOKEN SYSTEM
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // ✅ SAME COOKIE SYSTEM
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });

      // ✅ REDIRECT FRONTEND
      res.redirect("http://localhost:5173/");
    } catch (err) {
      console.log("GOOGLE ERROR:", err);
      res.redirect("http://localhost:5173/login");
    }
  }
);

export default router;