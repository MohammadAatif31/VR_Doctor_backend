// Utility function to format the response from Gemini into a user-friendly format

 
/*
export const formatResponse = (dataArray) => {
  if (!Array.isArray(dataArray)) {
    dataArray = [dataArray];
  }

  // collect all fields
  const problems = [];
  const causes = [];
  const remedies = [];
  const medicines = [];
  const advices = [];
  const severityList = [];

  dataArray.forEach(item => {
    if (item.problem) problems.push(item.problem);
    if (item.cause) causes.push(item.cause);
    if (item.remedies) remedies.push(...item.remedies);
    if (item.medicine) medicines.push(item.medicine);
    if (item.advice) advices.push(item.advice);
    if (item.severity) severityList.push(item.severity);
  });

  const isSerious = severityList.includes("high");
  const conditions = isSerious ? ["High severity please consult doctor immediately!"] : ["Mild to moderate symptoms"];


  return `
${isSerious ? "🚨 URGENT: Serious symptom detected\n" : ""}
🩺 Problem:
${problems.join(", ")}

🔎 Possible Cause:
${causes.join(", ")}

⚠️ Severity:
${conditions.join(", ")}

🏠 Home Remedies:
${remedies.map(r => `• ${r}`).join("\n")}

💊 Common Medicines:
${medicines.join(", ")}

👨‍⚕️ AI Doctor Advice:
${advices.join(" ")}

`;
};*/


// New simplified version just returns the first item for each field
export const formatResponse = (dataArray) => {
  if (!Array.isArray(dataArray)) {
    dataArray = [dataArray];
  }

  // collect all fields
  const problems = [];
  const causes = [];
  const remedies = [];
  const medicines = [];
  const advices = [];
  let severityList = [];

  dataArray.forEach(item => {
    if (item.problem) problems.push(item.problem.toLowerCase());
    if (item.cause) causes.push(item.cause);
    if (item.remedies) remedies.push(...item.remedies);
    if (item.medicine) medicines.push(item.medicine);
    if (item.advice) advices.push(item.advice);
    if (item.severity) severityList.push(item.severity);
  });

  // ⭐ severity normalize (IMPORTANT)
  severityList = severityList.map(s => s.toLowerCase());

  // remove duplicates
  const uniqueProblems = [...new Set(problems)];
  const uniqueCauses = [...new Set(causes)];
  const uniqueRemedies = [...new Set(remedies)];
  const uniqueMedicines = [...new Set(medicines)];

  // make proper sentence → fever, headache and cold
  const makeSentence = (arr) => {
    if (arr.length === 1) return arr[0];
    if (arr.length === 2) return arr.join(" and ");
    return arr.slice(0, -1).join(", ") + " and " + arr[arr.length - 1];
  };

  // highest severity detect
  let finalSeverity = "LOW";

  if (severityList.includes("high")) finalSeverity = "HIGH";
  else if (severityList.includes("medium")) finalSeverity = "MEDIUM";

  const isSerious = finalSeverity === "HIGH";

  return `🩺🩺
Problem: You may have ${makeSentence(uniqueProblems)}.

🔎 Possible Cause:
${uniqueCauses.join(", ")}

⚠️ Severity:
${finalSeverity === "HIGH"
  ? "🚨 High severity — please consult doctor immediately!"
  : finalSeverity === "MEDIUM"
  ? "🟡 Moderate symptoms. Take care and monitor."
  : "🟢 Mild symptoms, home care recommended."}

🏠 Home Remedies:
${uniqueRemedies.map(r => `• ${r}`).join("\n")}

💊 Common Medicines:
${uniqueMedicines.join(", ")}

👨‍⚕️ AI Doctor Advice: ${advices.join(" ")}

${isSerious ? "🚨 URGENT: Serious symptom detected\n" : ""}
`;
};