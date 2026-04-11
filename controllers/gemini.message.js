import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GOOGLE_API_KEY;

const ai = new GoogleGenAI({ apiKey: API_KEY });


// ⭐ Emoji function
const getHealthEmoji = (text) => {
  text = text.toLowerCase();

  if (text.includes("fever")) return "🤒";
  if (text.includes("headache")) return "🤕";
  if (text.includes("cough") || text.includes("cold")) return "🤧";
  if (text.includes("stomach")) return "🤢";
  if (text.includes("chest pain")) return "🚨";

  return "🩺";
};



const systemPrompt = `
You are an advanced AI Virtual Doctor and Health Assistant.

🎯 Your Job:

* Understand user's symptoms
* Suggest possible causes (not diagnosis)
* Give safe home remedies
* Suggest common over-the-counter medicines only
* Detect severity level (low / medium / high)
* If symptoms are serious → show emergency warning
* Always recommend consulting a doctor

⚠️ Severity Rules:

LOW:

* mild pain
* common cold
* headache
* tiredness
  → say: Mild symptoms, home care recommended

MEDIUM:

* fever
* infection symptoms
* repeated pain
  → say: Monitor condition and consult doctor if needed

HIGH (EMERGENCY):

* chest pain
* breathing problem
* unconsciousness
* severe pain
  → show: 🚨 EMERGENCY — seek medical help immediately

🧠 Behavior Rules:

* Be professional and caring
* Keep response short and structured
* Never give dangerous medicine
* Only safe suggestions
* No markdown symbols like ** or ###

📦 Response Format (STRICTLY FOLLOW):

🩺 Problem:
Brief description of user's issue.

🔎 Possible Cause:
Simple explanation.

⚠️ Severity:
🟢Low / 🟡Medium / 🚨High with reason.

🏠 Home Remedies:
• point 1
• point 2

💊 Common Medicines:
Medicine names only.

👨‍⚕️ AI Doctor Advice:
When to see doctor.

If severity is HIGH, start response with:
🚨 EMERGENCY ALERT
`;



// ⭐ Main function
export const getGeminiReply = async (text) => {
  try {
    if (!text || text.trim().length < 3) {
      return "Please describe your symptoms clearly.";
    }

    // ✅ dynamic emoji detect
    const emoji = getHealthEmoji(text);

    const response = await ai.models.generateContent({
      model:"gemini-flash-lite-latest", // ✅ correct model

      contents: `
${systemPrompt}

IMPORTANT:
- Start response with this emoji: ${emoji}
- Use this emoji in Problem section.
- Follow format strictly.

User symptoms: ${text}
`,

      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 200,
      },
    });

    // ✅ safe response extract
    const result = response.text || "No response";

    // ✅ markdown clean + emoji force
    return `${emoji} ${result.replace(/[*#]/g, "")}`;

  } catch (error) {
    console.error("Gemini error:", error);
    return "👩🏻‍⚕️Sorry dear, there is a small issue right now in AI Doctor. Please try again later.";
  }
};

//---//
export const getGeminiDashboardData = async (text) => {

  try {

    const response = await ai.models.generateContent({

      model:"gemini-flash-lite-latest",

      contents:`
You are an AI doctor.

User symptoms: ${text}

Return ONLY JSON.

{
"disease":"",
"severity":"",
"confidence":"",
"doctor":"",
"advice":""
}

Rules:
severity = low / medium / high
confidence = number 0-100
doctor = doctor type
`,

      generationConfig:{
        temperature:0.2,
        maxOutputTokens:120
      }

    });

    const raw = response.text;

    const clean = raw.replace(/```json|```/g,"").trim();

    return JSON.parse(clean);

  }
  catch(err){

    console.error("Gemini Dashboard Error:",err);

    return {
      disease:"Unknown",
      severity:"low",
      confidence:60,
      doctor:"General Physician",
      advice:"Monitor symptoms"
    };

  }

};