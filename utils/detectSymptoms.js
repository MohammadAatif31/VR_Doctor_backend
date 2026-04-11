// detect symptoms
export const detectSymptoms = (text) => {
  const symptomsList = [
    "fever",
    "cold",
    "cough",
    "headache",
    "chest pain",
    "weakness",
    "vomiting",
    "dizziness",
    "stomach pain"
  ];

  const found = symptomsList.filter(symptom =>
     text.toLowerCase().includes(symptom)
    );
    return found;

};

// generate chat title
export const generateChatTitle = (text, symptoms) => {

  // ⭐ symptom mila
  if (symptoms.length === 1) {
    return `${symptoms[0]} problem`;
  }

  if (symptoms.length > 1) {
    return `${symptoms.join(" and ")} problem`;
  }

  // ⭐ symptom nahi mila → user message use karo
  return text.slice(0, 20); 
};