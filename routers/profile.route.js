import express from "express";
import { saveProfile, getProfile } from "../controllers/profile.controller.js";
import { protect } from "../middleware/auth.middleware.js"
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/save", protect, upload.single("photo"), saveProfile);
router.get("/user", protect, getProfile);

export default router; 