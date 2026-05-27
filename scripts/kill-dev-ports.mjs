/**
 * Stops Next.js dev servers on common local ports (Windows + Unix).
 * Run before deleting .next — never remove .next while `next dev` is still running.
 */
import { execSync } from "child_process";
import { platform } from "os";

/** Next.js dev ports — safe to kill while `npm run dev` starts the API on 4000 in parallel. */
const WEB_PORTS = [3000, 3003, 3004, 3005, 3010, 3020];

/** All dev ports including Express API (use for full reset / clean, not during concurrent dev). */
const ALL_PORTS = [...WEB_PORTS, 4000];

const PORTS =
  process.env.MEDINOVA_KILL_PORTS === "web-only" ? WEB_PORTS : ALL_PORTS;

function killPortWin(port) {
  try {
    const out = execSync(`netstat -ano -p tcp | findstr :${port}`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    });
    const pids = new Set();
    for (const line of out.split("\n")) {
      if (!line.includes("LISTENING")) continue;
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && /^\d+$/.test(pid)) pids.add(pid);
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
        console.log(`Stopped process ${pid} on port ${port}`);
      } catch {
        /* already exited */
      }
    }
  } catch {
    /* no listener */
  }
}

function killPortUnix(port) {
  try {
    execSync(`lsof -ti tcp:${port} | xargs -r kill -9`, { stdio: "ignore" });
    console.log(`Stopped listeners on port ${port}`);
  } catch {
    /* no listener */
  }
}

const kill = platform() === "win32" ? killPortWin : killPortUnix;

for (const port of PORTS) {
  kill(port);
}
