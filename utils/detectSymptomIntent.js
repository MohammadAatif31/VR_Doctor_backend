export const detectSymptomIntent = (text) => {

  const input = text.toLowerCase().trim();

  //////////////////////////////////////////////////////
  // GREETING DETECTION
  //////////////////////////////////////////////////////

  const greetings = ["hi","hello","hey","hii"];

  if (greetings.some(g => input.startsWith(g))) {
    return "greeting";
  }

  //////////////////////////////////////////////////////
  // DEEP QUESTION DETECTION
  //////////////////////////////////////////////////////

  const deepWords = [
    "what",
    "why",
    "how",
    "explain",
    "define",
    "cause",
    "treatment",
    "meaning"
  ];

  if (deepWords.some(word => input.includes(word))) {
    return "deep";
  }

  //////////////////////////////////////////////////////
  // SYMPTOM DETECTION
  //////////////////////////////////////////////////////

  const symptomWords = [
    "pain",
    "ache",
    "hurt",
    "hurts",
    "fever",
    "cold",
    "cough",
    "headache",
    "dizziness",
    "vomit",
    "breathing",
    "stomach",
    "chest"
  ];

  const triggerPatterns = [
    /i have/,
    /i feel/,
    /feeling/,
    /my .* hurts/,
    /pain in/,
    /having/
  ];

  for (const pattern of triggerPatterns) {
    if (pattern.test(input)) {
      return "symptom";
    }
  }

  for (const word of symptomWords) {
    if (input.includes(word)) {
      return "symptom";
    }
  }

  //////////////////////////////////////////////////////
  // DEFAULT
  //////////////////////////////////////////////////////

  return "general";
}; 