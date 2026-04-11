const symptomDictionary = {
  fever: ["fever","temperature","high temperature","fevr"],
  headache: ["headache","head pain","migraine","hedache",], 
  cough: ["cough","dry cough","heavy cough","couhg"],
  cold: ["cold","runny nose","blocked nose"],
  "chest pain": ["chest pain","tight chest","chest pressure","pain in chest"],
  "breathing problem": ["shortness of breath","breathing problem","breathless"],
  "stomach pain": ["stomach pain","belly pain","abdominal pain"],
  vomiting: ["vomiting","throwing up","vomit"],
  nausea: ["nausea","nauseous"],
  weakness: ["weakness","fatigue","tired"],
  dizziness: ["dizziness","dizzy","lightheaded"],
  "joint pain": ["joint pain","knee pain","bone pain","shoulder pain"],
  "back pain": ["back pain","lower back pain","spine pain"],
  "hair loss": ["hair fall","hair loss","losing hair"],
  "skin rash": ["skin rash","red skin","itchy skin"],
  "eye pain": ["eye pain","eye irritation","itchy eyes"], 
  "ear pain": ["ear pain","ear ringing"],
  "hand pain": ["hand pain","pain in hand","hand ache","sore hand"], 
};

export const ultimateSymptomEngine = (text) => {

  const input = text.toLowerCase();

  const detected = [];

  for (const symptom in symptomDictionary) {

    const synonyms = symptomDictionary[symptom];

for (const word of synonyms) {

  const pattern = new RegExp(`\\b${word}\\b`,"i");

  if (pattern.test(input)) {
    detected.push(symptom);
    break;
  }

}

  }

  return [...new Set(detected)];
};