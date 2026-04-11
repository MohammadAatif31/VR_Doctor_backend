import express from "express";
import {
  register,
  login,
  logout,
  refreshToken,
  changePassword,
  getMe
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import passport from "../config/passport.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";

const router = express.Router();

// ===============================
// 🔥 NORMAL AUTH
// ===============================
router.post("/register", register);
router.post("/login", login);
router.get("/refresh", refreshToken);

router.post("/logout", protect, logout);
router.post("/change-password", protect, changePassword);
router.get("/me", protect, getMe);

// ===============================
// 🔥 GOOGLE LOGIN START
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

      // ❌ banned user
      if (user.isBanned) {
        return res.redirect(
          "https://vr-doctor-frontend.vercel.app/login"
        );
      }

      // ✅ TOKENS
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // ✅ PRODUCTION COOKIES (VERY IMPORTANT)
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      });

      // ✅ SUCCESS REDIRECT
      res.redirect("https://vr-doctor-frontend.vercel.app");
      
    } catch (err) {
      console.log("GOOGLE ERROR:", err);

      res.redirect(
        "https://vr-doctor-frontend.vercel.app/login"
      );
    }
  }
);

export default router;