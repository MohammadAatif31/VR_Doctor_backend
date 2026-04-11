import { healthData } from "./healthDataloader.js";

const symptoms = Object.keys(healthData);

//////////////////////////////////////////////////////
// LEVENSHTEIN DISTANCE (FUZZY MATCH)
//////////////////////////////////////////////////////

const distance = (a, b) => {

  const dp = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {

    for (let j = 1; j <= b.length; j++) {

      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(
            dp[i - 1][j],
            dp[i][j - 1],
            dp[i - 1][j - 1]
          );

    }

  }

  return dp[a.length][b.length];

};

//////////////////////////////////////////////////////
// COMMON SPELLING FIX MAP
//////////////////////////////////////////////////////

const spellingMap = {

  fevr: "fever",
  fver: "fever",
  fiver: "fever",

  hedache: "headache",
  hedach: "headache",

  coldd: "cold",

  couhg: "cough",

  hnd: "hand",
  cest: "chest",
  chst: "chest",

};

//////////////////////////////////////////////////////
// ALIAS MAP
//////////////////////////////////////////////////////

const aliasMap = {
  feverish: "fever",
  migraine: "headache",
  chesttight: "chest pain",
  tightchest: "chest pain",
  breathless: "breathing problem",
};

//////////////////////////////////////////////////////
// PATTERN NORMALIZATION
//////////////////////////////////////////////////////

const normalizePatterns = (text) => {

  return text
    // ================= CHEST / HEART =================
    .replace(/pain in chest/g, "chest pain")
    .replace(/pain in my chest/g, "chest pain")
    .replace(/my chest hurts/g, "chest pain")
    .replace(/my chest is hurting/g, "chest pain")
    .replace(/chest hurts/g, "chest pain")
    .replace(/chest hurting/g, "chest pain")
    .replace(/hurt in chest/g, "chest pain")
    .replace(/tight chest/g, "chest pain")
    .replace(/pressure in chest/g, "chest pain")
    .replace(/chest discomfort/g, "chest pain")
    .replace(/cest discomfort/g, "chest pain")
    .replace(/heart pain/g, "chest pain")

    // ================= BREATHING =================
    .replace(/shortness of breath/g, "breathing problem")
    .replace(/difficulty breathing/g, "breathing problem")
    .replace(/hard to breathe/g, "breathing problem")
    .replace(/breathless/g, "breathing problem")
    .replace(/breath problem/g, "breathing problem")
    .replace(/breath issue/g, "breathing problem")

    // ================= STOMACH =================
    .replace(/pain in stomach/g, "stomach pain")
    .replace(/stomach hurts/g, "stomach pain")
    .replace(/burning in stomach/g, "stomach pain")
    .replace(/abdominal pain/g, "stomach pain")
    .replace(/belly pain/g, "stomach pain")

    // ================= HEAD =================
    .replace(/severe headache/g, "headache")
    .replace(/bad headache/g, "headache")
    .replace(/pain in head/g, "headache")
    .replace(/migraine pain/g, "headache")

    // ================= FEVER =================
    .replace(/high temperature/g, "fever")
    .replace(/running fever/g, "fever")
    .replace(/feverish/g, "fever")

    // ================= COUGH =================
    .replace(/dry cough/g, "cough")
    .replace(/continuous cough/g, "cough")
    .replace(/persistent cough/g, "cough")

    // ================= COLD =================
    .replace(/runny nose/g, "cold")
    .replace(/blocked nose/g, "cold")
    .replace(/nose congestion/g, "cold")

    // ================= THROAT =================
    .replace(/sore throat/g, "throat pain")
    .replace(/throat hurts/g, "throat pain")

    // ================= VOMITING =================
    .replace(/throwing up/g, "vomiting")
    .replace(/feeling like vomiting/g, "vomiting")

    // ================= NAUSEA =================
    .replace(/feeling nauseous/g, "nausea")

    // ================= BODY PAIN =================
    .replace(/body ache/g, "body pain")
    .replace(/muscle pain/g, "body pain")

    // ================= WEAKNESS =================
    .replace(/feeling weak/g, "weakness")
    .replace(/very tired/g, "weakness")

    // ================= BONE / JOINT =================
    .replace(/bone pain/g, "joint pain")
    .replace(/joint pain/g, "joint pain")
    .replace(/joint swelling/g, "joint pain")
    .replace(/knee pain/g, "joint pain")
    .replace(/shoulder pain/g, "joint pain")
    .replace(/elbow pain/g, "joint pain")

    // ================= HAND / FINGER =================
    .replace(/pain in hand/g, "hand pain")
    .replace(/hand hurts/g, "hand pain")
    .replace(/finger pain/g, "finger pain")
    .replace(/swollen finger/g, "finger swelling")
    .replace(/pain in hand/g, "hand pain")



    // ================= LEG / FOOT =================
    .replace(/leg pain/g, "leg pain")
    .replace(/foot pain/g, "foot pain")
    .replace(/ankle pain/g, "ankle pain")

    // ================= BACK =================
    .replace(/back pain/g, "back pain")
    .replace(/lower back pain/g, "back pain")
    .replace(/spine pain/g, "back pain")

    // ================= HAIR =================
    .replace(/hair falling/g, "hair loss")
    .replace(/hair fall/g, "hair loss")
    .replace(/losing hair/g, "hair loss")
    .replace(/bald spots/g, "hair loss")

    // ================= SKIN =================
    .replace(/skin rash/g, "skin rash")
    .replace(/red skin/g, "skin rash")
    .replace(/itchy skin/g, "skin itching")

    // ================= EYES =================
    .replace(/eye pain/g, "eye pain")
    .replace(/blurred vision/g, "vision problem")
    .replace(/itchy eyes/g, "eye irritation")

    // ================= EAR =================
    .replace(/ear pain/g, "ear pain")
    .replace(/ringing in ears/g, "ear ringing")

    // ================= TASTE / SMELL =================
    .replace(/loss of taste/g, "taste loss")
    .replace(/cannot taste/g, "taste loss")
    .replace(/loss of smell/g, "smell loss")


    .replace(/\s+/g, " ")
    .trim();

};

//////////////////////////////////////////////////////
// SMART SYMPTOM ENGINE
//////////////////////////////////////////////////////

export const smartSymptomEngine = (text) => {

  let input = text.toLowerCase();

  // remove filler words
  input = input.replace(
    /\b(i|im|i'm|have|am|is|are|was|were|my|the|a|an|and|or|feel|feeling|felt|having)\b/g,
    ""
  );

  input = normalizePatterns(input);

  const words = input.split(/\s+/);
  //////////////////////////////////////////////////////
  // PRESERVE BODY PART PAIN PHRASES
  //////////////////////////////////////////////////////

  const bodyParts = [
    "brain", "head", "chest", "hand", "leg", "foot", "eye",
    "ear", "back", "shoulder", "knee", "finger", "stomach"
  ];

  for (const part of bodyParts) {

    const pattern = new RegExp(`${part}\\s+pain`, "i");

    if (pattern.test(input)) {
      return `${part} pain`;
    }

  }

  const corrected = words.map(word => {

    //////////////////////////////////////////////////////
    // DIRECT SPELLING FIX
    //////////////////////////////////////////////////////

    if (spellingMap[word]) {
      return spellingMap[word];
    }

    //////////////////////////////////////////////////////
    // ALIAS FIX
    //////////////////////////////////////////////////////

    if (aliasMap[word]) {
      return aliasMap[word];
    }

    //////////////////////////////////////////////////////
    // GENERIC WORD BLOCK
    //////////////////////////////////////////////////////

    if (["pain", "problem", "issue", "hurt", "ache"].includes(word)) {
      return word;
    }

    //////////////////////////////////////////////////////
    // DISTANCE BASED SPELLING CORRECTION
    //////////////////////////////////////////////////////

    let best = word;
    let bestScore = Infinity;

    for (const symptom of symptoms) {

      const parts = symptom.split(" ");

      for (const part of parts) {

        // skip very small words
        if (word.length <= 2) continue;

        const dist = distance(word, part);

        if (dist <= 1 && dist < bestScore) {

          best = part;
          bestScore = dist;

        }

      }

    }

    return best;

  });

  let finalText = corrected.join(" ");

  //////////////////////////////////////////////////////
  // DYNAMIC PAIN PHRASE FIX
  //////////////////////////////////////////////////////

  if (finalText.includes("pain")) {

    const words = finalText.split(" ");

    for (const symptom of symptoms) {

      const parts = symptom.split(" ");

      // example: chest pain
      if (parts.length === 2 && parts[1] === "pain") {

        const bodyPart = parts[0];

        if (finalText.includes(`pain ${bodyPart}`) || finalText.includes(`pain in ${bodyPart}`)) {
          finalText = symptom;
        }

      }

    }

  }

  return finalText;

};