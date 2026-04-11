import Chat from "../models/chat.model.js";
import HealthLog from "../models/healthLog.model.js";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import { healthData } from "../utils/healthDataloader.js";

import { getGeminiReply, getGeminiDashboardData } from "./gemini.message.js";

import { matchSymptom } from "../utils/matchSymptom.js";
import { fuzzyMatch } from "../utils/fuzzyMatch.js";
import { formatResponse } from "../utils/formatResponse.js";

import { getCache, setCache } from "../cache/responseCache.js";

import { botGreeting } from "../data/botGreeting.js";

import { debugLog } from "../utils/debugLogger.js";

import { detectSymptoms, generateChatTitle } from "../utils/detectSymptoms.js";
import { extractAIFields } from "../utils/extractAIFields.js";
import { smartSymptomEngine } from "../utils/smartSymptomEngine.js";
import { detectSymptomIntent } from "../utils/detectSymptomIntent.js";
import { ultimateSymptomEngine } from "../utils/ultimateSymptomEngine.js";
import { encryptText } from "../utils/encryption.js";




// =====================================================
// AI CHAT MESSAGE CONTROLLER
// =====================================================

export const Message = async (req, res) => {

  try {

    let { text, chatId } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ error: "Text cannot be empty" });
    }



    //////////////////////////////////////////////////////
    // ORIGINAL USER TEXT (UI FIX)
    //////////////////////////////////////////////////////

    const originalText = text;

    text = text.trim().toLowerCase();



    //////////////////////////////////////////////////////
    // SMART SPELLING FIX
    //////////////////////////////////////////////////////
    const correctedText = smartSymptomEngine(text);

    if (correctedText && correctedText.length > 0) {
      text = correctedText;
    }

    console.log("after smart engine", text);
    //////////////////////////////////////////////////////
    // SYMPTOM INTENT DETECTION (FIXED FLOW)FIX
    //////////////////////////////////////////////////////

    let intent = detectSymptomIntent(text);


    let isSymptom = intent === "symptom";

    //////////////////////////////////////////////////////
    // ADVANCED USER INPUT NORMALIZATION (SAFE VERSION)
    //////////////////////////////////////////////////////  

    // remove common filler / sentence words
    text = text.replace(
      /\b(i|im|i'm|ive|am|is|are|was|were|been|being|have|has|had|having|feel|feels|feeling|felt|suffer|suffers|suffering|suffered|experience|experiences|experiencing|experienced|get|geting|getting|got|gotten|there|there's|thereis|my|mine|the|a|an|from|with|of|to|for|that|this|it|its|about|very|really|quite|little|bit|kind|sort)\b/gi,
      ""
    );

    // normalize connectors between symptoms
    text = text.replace(/\b(and|also|plus|aswell|alongwith|togetherwith|with|&)\b/gi, " ");

    // remove punctuation
    text = text.replace(/[.,!?;:]/g, " ");

    // normalize spaces
    text = text.replace(/\s+/g, " ").trim();

    console.log("after normalization", text)

    console.log("ORIGINAL TEXT:", originalText);
    console.log("TEXT BEFORE MATCH:", text);

    //////////////////////////////////////////////////////
    // DIRECT JSON MATCH
    //////////////////////////////////////////////////////

    let jsonMatch = matchSymptom(text);
    // force symptom only if not deep question
    if (intent !== "deep" && jsonMatch) {
      intent = "symptom";
    }


    //////////////////////////////////////////////////////
    // SECOND JSON CHECK AFTER SPELL FIX
    //////////////////////////////////////////////////////

    if (!jsonMatch) {
      jsonMatch = matchSymptom(text);
    }

    //////////////////////////////////////////////////////
    // FUZZY MATCH
    //////////////////////////////////////////////////////

    if (!jsonMatch) {

      const fuzzy = fuzzyMatch(text);

      if (fuzzy) {
        jsonMatch = fuzzy;
      }

    }

    //////////////////////////////////////////////////////
    // ULTIMATE SYMPTOM ENGINE
    //////////////////////////////////////////////////////

    if (!jsonMatch) {

      const extractedSymptoms = ultimateSymptomEngine(text);

      if (extractedSymptoms.length > 0) {

        const combinedText = extractedSymptoms.join(" ");

        jsonMatch = matchSymptom(combinedText);



      }

    }

    console.log("FINAL TEXT:", text);
    console.log("JSON MATCH:", jsonMatch);


    //////////////////////////////////////////////////////
    // DETECT SYMPTOMS
    //////////////////////////////////////////////////////

    let detectedSymptoms = [];

    if (jsonMatch && jsonMatch.data) {

      detectedSymptoms = jsonMatch.data.map(
        d => d.problem?.toLowerCase() || d.disease?.toLowerCase()
      );

    } else {

      detectedSymptoms = detectSymptoms(text);

    }

    const severityFromSymptom =
      detectedSymptoms.length > 0 ? "medium" : "low";

    //////////////////////////////////////////////////////
    // USER AUTH
    //////////////////////////////////////////////////////

    const userId = req.user;
    const user = await User.findById(userId);

    // ============================
    // ⏳ 12 HOURS RESET
    // ============================
    const now = new Date();

    if (!user.lastMessageTime) {
      user.lastMessageTime = now;
    }

    const diffHours = (now - user.lastMessageTime) / (1000 * 60 * 60);

    if (diffHours >= 12) {
      user.messageCount = 0;
      user.lastMessageTime = now;
      await user.save();
    }

    // ============================
    // ⏳ EXPIRY CHECK (FIRST)
    // ============================
    if (user.role !== "admin") {
      if (user.isPremium && user.premiumExpiry) {
        if (new Date() > user.premiumExpiry) {
          user.isPremium = false;
          user.autoRenew = false;
          await user.save();
        }
      }
    }

    // ============================
    // 🚫 LIMIT CHECK (ONLY ONCE)
    // ============================
    if (user.role !== "admin") {
      if (!user.isPremium && user.messageCount >= 5) {
        return res.status(403).json({
          error: "🚫 Free limit reached. Upgrade to premium."
        });
      }
    }

    //----db--//
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ error: "Unauthorized user" });
    }

    //////////////////////////////////////////////////////
    // FIND OR CREATE CHAT
    //////////////////////////////////////////////////////

    let chat;

    if (!chatId) {

      const title = generateChatTitle(originalText, detectedSymptoms);

      chat = await Chat.create({
        userId,
        title,
        messages: []
      });

    } else {

      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        return res.status(400).json({ error: "Invalid chat id" });
      }

      chat = await Chat.findOne({
        _id: chatId,
        userId
      });

    }

    //////////////////////////////////////////////////////
    // SAVE USER MESSAGE (ORIGINAL TEXT)
    //////////////////////////////////////////////////////

    chat.messages.push({
      sender: "user",
      text: encryptText(originalText) //encrypt chat
    });

    //////////////////////////////////////////////////////
    // VARIABLES
    //////////////////////////////////////////////////////

    let botResponse = null;

    let detectedDisease = null;
    let detectedSeverity = null;
    let confidence = null;
    let doctorType = null;
    let adviceText = null;

    let finalSeverity = severityFromSymptom;


    //////////////////////////////////////////////////////
    // INTENT DETECTION
    //////////////////////////////////////////////////////

    debugLog("intent:", intent);

    //////////////////////////////////////////////////////
    // GREETING RESPONSE
    //////////////////////////////////////////////////////

    if (!botResponse && intent === "greeting") {

      for (const category in botGreeting) {

        if (botGreeting[category][text]) {

          botResponse = botGreeting[category][text];

          debugLog("greeting matched");

          break;

        }

      }

    }

    //////////////////////////////////////////////////////
    // JSON SYMPTOM MATCH (UPDATED - SAFE VERSION)
    //////////////////////////////////////////////////////

    if (!botResponse && intent === "symptom" && jsonMatch) {

      //////////////////////////////////////////////////////
      // NORMALIZE JSON DATA
      //////////////////////////////////////////////////////

      const data = Array.isArray(jsonMatch.data)
        ? jsonMatch.data
        : [jsonMatch.data || jsonMatch];

      //////////////////////////////////////////////////////
      // FINAL UNKNOWN SYMPTOM DETECTOR (WORD BASED)
      //////////////////////////////////////////////////////

      const jsonKeys = Object.keys(healthData).map(k => k.toLowerCase());

      const words = text.split(/\s+/);

      const matchedSymptoms = [];
      const unknownSymptoms = [];

      for (const word of words) {

        const exists = jsonKeys.some(sym => sym.includes(word));

        if (exists) {
          matchedSymptoms.push(word);
        } else {
          unknownSymptoms.push(word);
        }

      }

      console.log("matched JSON symptoms:", matchedSymptoms);
      console.log("unknown symptoms:", unknownSymptoms);

      //////////////////////////////////////////////////////
      // UNKNOWN SYMPTOM DETECTED → CALL GEMINI
      //////////////////////////////////////////////////////

      if (unknownSymptoms.length > 0) {

        debugLog("Unknown symptom detected → Gemini");

        const aiData = await getGeminiDashboardData(originalText);

        detectedDisease = aiData.disease || "Possible condition";
        detectedSeverity = aiData.severity || "medium";
        confidence = aiData.confidence || 60;
        doctorType = aiData.doctor || "General Physician";
        adviceText = aiData.advice || "Consult doctor if symptoms worsen.";

        finalSeverity = detectedSeverity;
        try {

          botResponse = await getGeminiReply(originalText);

        } catch (err) {

          console.log("Gemini limit reached");

          botResponse =
            "⚠️ AI service busy right now. Please try again in a moment.";

        }

        setCache(text, botResponse);


      }

      //////////////////////////////////////////////////////
      // SINGLE SYMPTOM CASE
      //////////////////////////////////////////////////////

      else if (data.length === 1) {

        const bestMatch = data[0];

        botResponse = formatResponse([bestMatch]);

        detectedDisease = bestMatch.disease || bestMatch.problem;

        detectedSeverity = bestMatch.severity || "low";

        confidence = bestMatch.confidence || 60;

        doctorType = bestMatch.doctor || "General Physician";

        adviceText = bestMatch.advice || "";

        finalSeverity = detectedSeverity;

      }


      //////////////////////////////////////////////////////
      // MULTIPLE SYMPTOM CASE (FIXED VERSION)
      //////////////////////////////////////////////////////

      else {

        // Remove duplicate symptoms
        const unique = [];
        const seen = new Set();

        for (const item of data) {

          const key = item.problem || item.disease;

          if (!seen.has(key)) {
            seen.add(key);
            unique.push(item);
          }

        }

        //////////////////////////////////////////////////////
        // Format response with all symptoms
        //////////////////////////////////////////////////////

        botResponse = formatResponse(unique);


        //////////////////////////////////////////////////////
        // Combine diseases
        //////////////////////////////////////////////////////

        detectedDisease = unique
          .map(d => d.disease || d.problem)
          .join(", ");


        //////////////////////////////////////////////////////
        // Severity logic
        //////////////////////////////////////////////////////

        detectedSeverity = unique.some(d => d.severity === "high")
          ? "high"
          : unique.some(d => d.severity === "medium")
            ? "medium"
            : "low";


        //////////////////////////////////////////////////////
        // Confidence (highest)
        //////////////////////////////////////////////////////

        confidence = Math.max(...unique.map(d => d.confidence || 60));


        //////////////////////////////////////////////////////
        // Doctor suggestion
        //////////////////////////////////////////////////////

        doctorType =
          unique.map(d => d.doctor).filter(Boolean)[0] ||
          "General Physician";


        //////////////////////////////////////////////////////
        // Advice combine
        //////////////////////////////////////////////////////

        adviceText = unique
          .map(d => d.advice)
          .filter(Boolean)
          .join(" ");


        finalSeverity = detectedSeverity;

      }

      debugLog("JSON matched");

    }

    //////////////////////////////////////////////////////
    // FUZZY MATCH
    //////////////////////////////////////////////////////

    if (!botResponse && intent === "symptom" && !jsonMatch) {

      const fuzzyData = fuzzyMatch(text);

      if (fuzzyData) {

        const data = fuzzyData.data || fuzzyData;

        botResponse = formatResponse(data);

        //////////////////////////////////////////////////////
        // SAFE DATA EXTRACTION
        //////////////////////////////////////////////////////
        detectedDisease =
          data?.disease ||
          healthData[data?.problem?.toLowerCase()]?.disease ||
          data?.problem ||
          "Unknown";

        detectedSeverity = data?.severity || "low";

        confidence = data?.confidence || 60;

        doctorType = data?.doctor || "General Physician";

        adviceText = data?.advice || "Monitor symptoms and rest.";

        finalSeverity = detectedSeverity;

        //////////////////////////////////////////////////////
        // DASHBOARD SYMPTOM FIX
        //////////////////////////////////////////////////////

        detectedSymptoms = [
          data?.problem?.toLowerCase() ||
          data?.disease?.toLowerCase() ||
          "text symptom"
        ];

        debugLog("fuzzy match used");

      }

    }

    //////////////////////////////////////////////////////
    // CACHE CHECK
    //////////////////////////////////////////////////////

    if (!botResponse) {

      const cached = getCache(text);

      if (cached) {

        botResponse = cached;

        const aiData = extractAIFields(botResponse);

        detectedDisease = aiData.disease;

        detectedSeverity = aiData.severity;

        confidence = aiData.confidence;

        doctorType = aiData.doctor;

        finalSeverity = detectedSeverity;

        debugLog("cache used");

      }

    }

    //////////////////////////////////////////////////////
    // GEMINI FALLBACK
    //////////////////////////////////////////////////////

    if (!botResponse && (intent === "deep" || !detectedDisease)) {

      const aiData = await getGeminiDashboardData(text);

      detectedDisease = aiData.disease || "Possible Infection";
      detectedSeverity = aiData.severity || "medium";
      confidence = aiData.confidence || 60;
      doctorType = aiData.doctor || "General Physician";
      adviceText = aiData.advice || "Drink fluids and take rest.";

      finalSeverity = detectedSeverity;

      botResponse = await getGeminiReply(text);

      setCache(text, botResponse);

      debugLog("gemini api used");

    }

    //////////////////////////////////////////////////////
    // SAVE BOT MESSAGE
    //////////////////////////////////////////////////////

    chat.messages.push({
      sender: "bot",
      text: encryptText(botResponse) //encrypt bot message//
    });

    //////////////////////////////////////////////////////
    // UPDATE CHAT TITLE
    //////////////////////////////////////////////////////

    if (chat.title === "New Chat") {

      chat.title = generateChatTitle(originalText, detectedSymptoms);

    }

    await chat.save();

    //////////////////////////////////////////////////////
    // SAVE DASHBOARD DATA
    //////////////////////////////////////////////////////

    await HealthLog.create({

      userId,

      symptoms:
        detectedSymptoms.length > 0
          ? detectedSymptoms.join(", ")
          : detectedDisease,

      severity: finalSeverity,

      disease: detectedDisease,

      confidence: confidence,

      doctor: doctorType,

      advice: adviceText,

      response: botResponse,

      date: new Date()

    });

    console.log("dashboard disease:", detectedDisease);

    //////////////////////////////////////////////////////
    // FINAL RESPONSE
    //////////////////////////////////////////////////////
    await User.findByIdAndUpdate(userId, {
      $inc: { messageCount: 1 },
      lastMessageTime: new Date()
    });


    res.status(200).json({

      chatId: chat._id,

      userMessage: originalText,

      botMessage: botResponse

    });


  } catch (error) {

    console.error("Message Controller Error:", error);

    res.status(500).json({
      error: "⚠️ System error"
    });

  }

};   