/**
 * Update .env.local with a MongoDB Atlas connection string.
 * Usage: node scripts/set-mongodb-uri.mjs "mongodb+srv://user:pass@cluster0.xxx.mongodb.net/medinova"
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env.local");
const rawUri = process.argv[2]?.trim();

if (!rawUri || !rawUri.startsWith("mongodb")) {
  console.error(
    'Usage: node scripts/set-mongodb-uri.mjs "mongodb+srv://user:pass@cluster0.xxx.mongodb.net/medinova"'
  );
  process.exit(1);
}

const match = rawUri.match(
  /^mongodb(\+srv)?:\/\/([^:@/]+)(?::([^@/]*))?@([^/]+)\/([^?]+)/
);

let lines = fs.existsSync(envPath)
  ? fs.readFileSync(envPath, "utf-8").split(/\r?\n/)
  : [];

function upsert(key, value) {
  const idx = lines.findIndex((line) => line.startsWith(`${key}=`));
  const entry = `${key}=${value}`;
  if (idx >= 0) lines[idx] = entry;
  else lines.push(entry);
}

function commentOut(keyPrefix) {
  lines = lines.map((line) => {
    if (line.startsWith(`${keyPrefix}=`) && !line.startsWith("#")) {
      return `# ${line}`;
    }
    return line;
  });
}

if (match) {
  const [, srv, user, password = "", host, database] = match;
  commentOut("MONGODB_URI");
  upsert("MONGODB_ATLAS_USER", decodeURIComponent(user));
  upsert("MONGODB_ATLAS_PASSWORD", decodeURIComponent(password));
  upsert("MONGODB_ATLAS_CLUSTER", host);
  upsert("MONGODB_DB", database);
  console.log("Saved Atlas settings to .env.local (password stored safely, @ supported).");
} else {
  commentOut("MONGODB_ATLAS_USER");
  commentOut("MONGODB_ATLAS_PASSWORD");
  commentOut("MONGODB_ATLAS_CLUSTER");
  commentOut("MONGODB_DB");
  upsert("MONGODB_URI", rawUri);
  console.log("Saved MONGODB_URI to .env.local.");
}

fs.writeFileSync(envPath, `${lines.join("\n").replace(/\n+$/, "")}\n`, "utf-8");
console.log("Next: npm run mongo:test && npm run seed && npm run dev");
