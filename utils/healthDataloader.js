import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname fix for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// correct path
const filePath = path.join(__dirname, "../data/healthData.json");

export const healthData = JSON.parse(
  fs.readFileSync(filePath, "utf-8")
);