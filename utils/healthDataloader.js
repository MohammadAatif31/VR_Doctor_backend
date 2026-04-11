import fs from "fs";
import path from "path";

const filePath = path.resolve("./data/healthData.json");

export const healthData =
JSON.parse(fs.readFileSync(filePath,"utf-8"));