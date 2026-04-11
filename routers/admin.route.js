import express from "express";

import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/role.middleware.js";

import {
  getDashboard,
  deleteUser,
  getAllUsers,
  getAllChats,
  getAllHealthLogs,
  deleteChat,
  deleteHealthLog,
  deleteAllHealthLogs,
  toggleBanUser,
  getAnalytics,
  deleteAllChats,
  getPremiumUsers  
} from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/dashboard", protect, isAdmin, getDashboard);

router.delete("/user/:id", protect, isAdmin, deleteUser);

router.get("/users", protect, isAdmin, getAllUsers);

router.get("/chats", protect, isAdmin, getAllChats);

router.get("/healthlogs", protect, isAdmin, getAllHealthLogs);

router.delete("/chat/:id", protect, isAdmin, deleteChat);

router.delete("/healthlog/:id", protect, isAdmin, deleteHealthLog);

router.delete("/healthlogs/all", protect, isAdmin, deleteAllHealthLogs);

router.get("/analytics",protect,isAdmin,getAnalytics);

router.patch("/user/ban/:id",protect,isAdmin,toggleBanUser);

router.delete("/chats/all", protect, isAdmin, deleteAllChats);

router.get("/premium-users", protect, isAdmin, getPremiumUsers);

export default router;