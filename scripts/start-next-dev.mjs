/**
 * Wait for Express API, then start Next.js (avoids Windows libuv crash from
 * `wait-for-api.mjs && npx next dev` shell chaining).
 */
import { exec, spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const API_URL = process.env.API_URL ?? "http://localhost:4000";
const LOGIN_URL = process.env.CLIENT_URL ?? "http://localhost:3000";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAX_ATTEMPTS = 45;
const INTERVAL_MS = 1000;

async function ping() {
  try {
    const res = await fetch(`${API_URL}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function waitForApi() {
  console.log(`Waiting for API at ${API_URL}/health ...`);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (await ping()) {
      console.log("API is ready.");
      return true;
    }
    if (attempt < MAX_ATTEMPTS) {
      process.stdout.write(`  attempt ${attempt}/${MAX_ATTEMPTS}\r`);
      await new Promise((r) => setTimeout(r, INTERVAL_MS));
    }
  }

  console.warn(
    "\nAPI did not respond in time — starting Next.js anyway.\n" +
      "Dashboard and Symptom Checker demo data work without the API.\n" +
      "For login, run npm run dev from the project root (starts API + web).\n"
  );
  return false;
}

await waitForApi();

// Brief pause avoids occasional Windows UV_HANDLE_CLOSING when spawning after concurrent startup
await new Promise((r) => setTimeout(r, 600));

console.log("Starting Next.js on http://localhost:3000 ...");

function openLoginPage() {
  if (process.env.MEDINOVA_OPEN_BROWSER === "0") return;

  const cmd =
    process.platform === "win32"
      ? `cmd /c start "" "${LOGIN_URL}"`
      : process.platform === "darwin"
        ? `open "${LOGIN_URL}"`
        : `xdg-open "${LOGIN_URL}"`;

  exec(cmd, (err) => {
    if (err) {
      console.warn(`Could not open browser — visit ${LOGIN_URL} manually.`);
    }
  });
}

async function waitForWeb(maxAttempts = 90) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(LOGIN_URL, {
        cache: "no-store",
        redirect: "manual",
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok || (res.status >= 300 && res.status < 400)) {
        return true;
      }
    } catch {
      // Next.js still starting
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

async function warmHealthRoute() {
  for (let attempt = 1; attempt <= 20; attempt++) {
    try {
      const res = await fetch(`${LOGIN_URL}/api/health`, {
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) return true;
    } catch {
      // route still compiling
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  return false;
}

const child = spawn("npx", ["next", "dev", "-p", "3000"], {
  cwd: root,
  // Ignore stdin so Next.js keeps running when started from a background terminal.
  stdio: ["ignore", "inherit", "inherit"],
  shell: true,
  env: process.env,
});

void (async () => {
  if (await waitForWeb()) {
    await warmHealthRoute();
    console.log(`Opening login page at ${LOGIN_URL} ...`);
    openLoginPage();
  } else {
    console.warn(`Next.js did not respond in time — open ${LOGIN_URL} manually.`);
  }
})();

child.on("error", (err) => {
  console.error("Failed to start Next.js:", err.message);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.exit(1);
  }
  process.exit(code ?? 0);
});
