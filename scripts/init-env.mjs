import fs from "fs";
import path from "path";

const root = process.cwd();
const target = path.join(root, ".env.local");
const example = path.join(root, ".env.local.example");

if (fs.existsSync(target)) {
  console.log(".env.local already exists — edit OPENAI_API_KEY there, then restart npm run dev.");
  process.exit(0);
}

if (!fs.existsSync(example)) {
  console.error(".env.local.example not found.");
  process.exit(1);
}

fs.copyFileSync(example, target);
console.log("Created .env.local from .env.local.example");
console.log("Next: open .env.local, set OPENAI_API_KEY=sk-..., then run npm run dev");
