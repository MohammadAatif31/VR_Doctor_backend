export const debugLog = (type) => {
  const time = new Date().toLocaleTimeString();

  const messages = {
    greeting: "🤝 GREETING HIT",
    json: "📦 JSON DATA HIT",
    fuzzy: "🔍 FUZZY MATCH HIT",
    cache: "⚡ CACHE HIT",
    "gemini-cache": "⚡ GEMINI CACHE HIT",
    "gemini-api": "🤖 GEMINI API CALL",
    fallback: "❓ FALLBACK RESPONSE"
  };

  console.log(`\n---------------------------`);
  console.log(`⏰ ${time}`);
  console.log(`${messages[type] || type}`);
  console.log(`-----------------------------\n`);
};