import Chat from "../models/chat.model.js";
import { decryptText } from "../utils/encryption.js";

// ============================================
// CREATE NEW CHAT (Protected)
// ============================================
export const createChat = async (req, res) => {
  try {
    const userId = req.user;

    const chat = await Chat.create({
      userId,
      title: "New Chat",
      messages: []
    });

    res.status(201).json(chat);

  } catch (err) {
    console.error("Create Chat Error:", err);
    res.status(500).json({ error: "Failed to create chat" });
  }
};


// ============================================
// GET ALL USER CHATS
// ============================================
export const getUserChats = async (req, res) => {
  try {
    const userId = req.user;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized user"
      });
    }

    const chats = await Chat.find({ userId })
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);

  } catch (error) {
    console.error("getUserChats ERROR:", error);
    res.status(500).json({
      error: "Failed to fetch chats"
    });
  }
};


// ============================================
// GET SINGLE CHAT (FIXED)
// ============================================
export const getSingleChat = async (req, res) => {
  try { 
    const { chatId } = req.params;
    const userId = req.user;

   const chat = await Chat.findOne({
  _id: chatId,
  userId: userId
});

if (!chat) {
  return res.status(404).json({
    error: "Chat not found"
  });
}

// 🔐 DECRYPT ALL MESSAGES  
chat.messages = chat.messages.map(msg => ({
  ...msg._doc,
  text: msg.text ? decryptText(msg.text) : ""
}));

res.status(200).json(chat);

  } catch (error) {
    console.log("Get single chat error:", error);
    res.status(500).json({ error: "Server error" });
  }
};


// ============================================
// DELETE SINGLE CHAT
// ============================================
export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user;

    const deleted = await Chat.deleteOne({
      _id: chatId,
      userId
    });

    if (deleted.deletedCount === 0) {
      return res.status(404).json({
        error: "Chat not found or not authorized"
      });
    }

    res.json({ message: "Chat deleted successfully" });

  } catch (err) {
    console.error("Delete Chat Error:", err);
    res.status(500).json({ error: "Failed to delete chat" });
  }
};


// ============================================
// DELETE ALL CHATS (NEW — REQUIRED)
// ============================================
export const deleteAllChats = async (req, res) => {
  try {
    const userId = req.user;

    await Chat.deleteMany({ userId });

    res.json({
      message: "All chats deleted"
    });

  } catch (error) {
    console.log("Delete all error:", error);
    res.status(500).json({
      error: "Failed to delete chats"
    });
  }
};


// ============================================
// RENAME CHAT
// ============================================
export const renameChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { title } = req.body;
    const userId = req.user;

    if (!title?.trim()) {
      return res.status(400).json({
        error: "Title cannot be empty"
      });
    }

    const chat = await Chat.findOneAndUpdate(
      {
        _id: chatId,
        userId
      },
      {
        title: title.trim()
      },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({
        error: "Chat not found or not authorized"
      });
    }

    res.json(chat);

  } catch (err) {
    console.error("Rename Chat Error:", err);
    res.status(500).json({ error: "Failed to rename chat" });
  }
};