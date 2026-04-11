import express from "express";
import { Message } from "../controllers/chatbot.message.js";
import { protect } from "../middleware/auth.middleware.js";

import {
  createChat,
  getUserChats,
  deleteChat,
  renameChat,
  getSingleChat,
  deleteAllChats
} from "../controllers/chat.controller.js";

const router = express.Router();

// CHAT BOT MESSAGE
// ===============================
router.post("/message", protect, Message);

// ===============================
// CHAT SYSTEM
// ===============================

// CREATE CHAT
router.post("/chat/create", protect, createChat);

// GET ALL USER CHATS  (⚠ always above :chatId)
router.get("/chat/user", protect, getUserChats);

// DELETE ALL CHATS  ⭐ NEW
router.delete("/chat/all", protect, deleteAllChats);

// GET SINGLE CHAT
router.get("/chat/:chatId", protect, getSingleChat);

// DELETE SINGLE CHAT
router.delete("/chat/:chatId", protect, deleteChat);

// RENAME CHAT
router.put("/chat/:chatId", protect, renameChat);

export default router;