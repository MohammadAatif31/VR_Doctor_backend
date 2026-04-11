import express from "express";
import { getHealthHistory } from "../controllers/health.controller.js";
import { protect } from "../middleware/auth.middleware.js"

const router = express.Router();

router.get("/history",protect, getHealthHistory);

export default router;