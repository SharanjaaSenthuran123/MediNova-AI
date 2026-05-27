/**
 * Wait until Express API responds on /health before starting Next.js.
 */
const API_URL = process.env.API_URL ?? "http://localhost:4000";
const MAX_ATTEMPTS = 30;
const INTERVAL_MS = 1000;

async function ping() {
  try {
    const res = await fetch(`${API_URL}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

console.log(`Waiting for API at ${API_URL}/health ...`);

for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  if (await ping()) {
    console.log("API is ready.");
    process.exit(0);
  }
  if (attempt < MAX_ATTEMPTS) {
    process.stdout.write(`  attempt ${attempt}/${MAX_ATTEMPTS}\r`);
    await new Promise((r) => setTimeout(r, INTERVAL_MS));
  }
}

console.error(
  `\nAPI did not start within ${MAX_ATTEMPTS}s.\n` +
    "Run npm run dev from the project root (starts API + web together).\n"
);
process.exit(1);
