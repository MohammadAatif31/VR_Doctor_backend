
import { healthData } from "./healthDataloader.js";

export const matchSymptom = (text) => {

  const cleaned = text
    .toLowerCase()
    .replace(/[.,!?]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const matched = [];

  const keys = Object.keys(healthData);

  const regexCache = {};

  for (const key of keys) {

    if (!regexCache[key]) {
      regexCache[key] = new RegExp(`\\b${key}\\b`, "i");
    }

    if (regexCache[key].test(cleaned)) {

      matched.push(healthData[key]);

    }

  }

  if (matched.length === 0) return null;

  return { data: matched };

};