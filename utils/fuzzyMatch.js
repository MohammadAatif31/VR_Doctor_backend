import fs from "fs";
import path from "path";
import Fuse from "fuse.js";

const filePath = path.resolve("./data/healthData.json");
const healthData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

const list = Object.keys(healthData).map(key => ({
  keyword: key,
  data: healthData[key]
}));

const fuse = new Fuse(list, {
  keys: ["keyword"],
  threshold: 0.25,   // ⭐ spelling tolerance
  distance :100,
  includeMatches:true
});

export const fuzzyMatch = (text) => {

  const cleaned = text.toLowerCase().trim();
   const words = cleaned.split(" ");

if (words.length === 1) {
  return null;
}

  // ⭐ generic words block
  const genericWords = ["pain","problem","issue","sick","hurt","ache"];

  if (genericWords.includes(cleaned)) {
    return null;
  }

  const result = fuse.search(cleaned);

  if (!result.length) return null;

  const data = result[0].item.data;

  data.disease =
    data.disease ||
    healthData[data.problem?.toLowerCase()]?.disease ||
    data.problem ||
    "Unknown";

  return {
    data:[data]
  }

};