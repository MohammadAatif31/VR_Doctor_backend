export const extractAIFields = (text) => {

  const lower = text.toLowerCase();

  let severity = "low";
  let disease = "unknown";
  let confidence = 60;
  let doctor = "General Physician";

  // ----------------------------
  // SEVERITY DETECTION
  // ----------------------------

  if (lower.includes("high") || lower.includes("🚨")) {
    severity = "high";
    confidence = 85;
  }

  else if (lower.includes("medium") || lower.includes("moderate")) {
    severity = "medium";
    confidence = 70;
  }

  else {
    severity = "low";
    confidence = 60;
  }

  // ----------------------------
  // DISEASE DETECTION
  // ----------------------------

  if (lower.includes("fever")) {
    disease = "Viral Fever";
    doctor = "General Physician";
  }

  else if (lower.includes("cold") || lower.includes("cough")) {
    disease = "Common Cold";
    doctor = "General Physician";
  }

  else if (lower.includes("chest pain") || lower.includes("breathing")) {
    disease = "Respiratory Issue";
    doctor = "Cardiologist";
  }

  else if (lower.includes("headache")) {
    disease = "Migraine";
    doctor = "Neurologist";
  }

  return {
    disease,
    severity,
    confidence,
    doctor
  };

};