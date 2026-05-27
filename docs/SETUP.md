# MediNova-AI — Phase 1 Setup Guide

Phase 1 makes sure the project runs locally, routes work, and environment variables are clear before you polish features in later phases.

## Prerequisites

- Node.js 18+ (20+ recommended)
- npm (comes with Node.js)

## Install and run

```bash
cd MediNova-AI
npm install
npm run dev
```

**Important:** Let `npm install` finish completely (can take 1–3 minutes). If you cancel it (`Ctrl+C`), you will see:

```text
'next' is not recognized as an internal or external command
```

That means `node_modules` was never created. Run `npm install` again and wait until it completes.

### If install still fails

```bash
npm install --legacy-peer-deps
```

Or delete `node_modules` and `package-lock.json`, then run `npm install` again.

Open [http://localhost:3000](http://localhost:3000).

## Verify routes

Confirm each page loads without errors:

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/dashboard` | Health analytics dashboard |
| `/symptom-checker` | AI symptom checker |
| `/prescription-reader` | Prescription OCR |
| `/barcode-scanner` | Smart Medicine Scanner |
| `/emergency` | Emergency SOS simulation |
| `/reports` | Health reports |

## Do I need MongoDB?

**No — not for the hackathon demo.**

| Feature | Without MongoDB | With MongoDB + `npm run seed` |
|---------|-----------------|-------------------------------|
| Dashboard, Symptom Checker, OCR, barcode, SOS | ✅ Works | ✅ Works |
| Demo login (`patient@medinova.ai` / `demo123`) | ✅ In-memory demo mode | ✅ Full database |
| Saved history, profiles, appointments | Demo/mock only | Persistent data |

When MongoDB is not running, the API prints **DEMO MODE** and still works for login.

**Optional:** install [MongoDB Community](https://www.mongodb.com/try/download/community) locally, then:

```bash
npm run seed
npm run dev
```

### Use your own email and password (real accounts)

Demo logins (`patient@medinova.ai` / `demo123`) work **without** MongoDB. **Your own email requires MongoDB** so accounts are saved in the database.

1. **Install MongoDB** — [MongoDB Community](https://www.mongodb.com/try/download/community) (local) or free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cloud cluster. **Step-by-step Atlas guide:** [MONGODB-ATLAS.md](./MONGODB-ATLAS.md)
2. **Set connection string** in `.env.local` (and `server/.env` if you use it):
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/medinova
   ```
   For Atlas:
   ```env
   MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/medinova
   ```
3. **Seed demo data** (optional but recommended):
   ```bash
   npm run seed
   ```
4. **Restart the app:**
   ```bash
   npm run dev
   ```
   Terminal should show `MongoDB connected` — **not** `DEMO MODE`.
5. **Register:** open [http://localhost:3000/register](http://localhost:3000/register) with your name, **your email**, and password (min 6 characters).
6. **Sign in** at `/` with that email and password.

After registration, your user is stored in MongoDB. Symptom history, profile, and other API features can persist to that account as you connect real data.

**Note:** You cannot register a custom email while the API is in DEMO MODE (MongoDB offline). Fix MongoDB first, then use Register.

## Environment variables (optional for Phase 1)

The app runs in **demo mode** without any API keys.

```bash
cp .env.local.example .env.local
```

Edit `.env.local` in the project root (not `.env.local.example`):

```env
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o-mini
```

Or run `npm run env:init` to create `.env.local` from the example, then paste your key.

- **Restart required:** after changing `.env.local`, stop and run `npm run dev` again.
- Without a valid key, the Symptom Checker returns smart demo results.
- OCR (Tesseract) and barcode scanning run in the browser — no keys needed.
- Emergency alerts are simulated only.

## Troubleshooting “Hydration mismatch” in the console

If the error mentions **`data-cursor-ref`** attributes, it is caused by **Cursor’s embedded browser** injecting automation attributes before React hydrates. Your app code is fine.

**Fix:** open the app in **Chrome or Edge** at `http://localhost:3000` instead of the Cursor preview panel.

If you still see hydration warnings in a normal browser (without `data-cursor-ref`), run `npm run dev:reset` and hard-refresh (Ctrl+Shift+R).

## Troubleshooting “Demo mode — add API key” (Phase 5 live AI)

1. Confirm the file exists: **`MediNova-AI/.env.local`** (not `.env.local.example`).
2. Set a real key: `OPENAI_API_KEY=sk-...` (no quotes needed).
3. **Restart** the dev server — env changes are not picked up until you stop and run `npm run dev` again.
4. Verify: open `http://localhost:3000/api/config/status` — should show `"liveAi": true`.

```bash
npm run env:check
```

## Troubleshooting “Internal Server Error”

This usually means the **`.next` build cache is corrupted** — often because `.next` was deleted while `npm run dev` was still running, or multiple dev servers were open at once.

1. Stop **all** dev terminals (Ctrl+C).
2. Run a full reset (stops ports 3000–3020, clears cache, restarts):

```bash
npm run dev:reset
```

Or manually:

```bash
npm run dev:clean
```

3. Open only **http://localhost:3000** (match the port in your terminal).
4. Hard-refresh the browser (Ctrl+Shift+R).

**Do not** delete the `.next` folder while the dev server is running.

## Troubleshooting “missing required error components, refreshing…”

This is a **Next.js dev server** issue, not your API key.

1. Stop **all** running `npm run dev` terminals (Ctrl+C).
2. Run once: `npm run dev:clean`
3. Do not run `npm run build` while `npm run dev` is still running.
4. Open only the port shown in the terminal (usually `http://localhost:3000`).

The app now includes `app/error.tsx`, `app/global-error.tsx`, and `app/not-found.tsx` so error boundaries compile correctly.

## Troubleshooting “404 — This page could not be found”

**Adding an API key does not cause 404.** A bad or missing key only affects the Symptom Checker API (demo fallback vs live AI). Pages like `/dashboard` should still load.

Common causes:

1. **Wrong URL** — Use exact paths (lowercase): `/`, `/dashboard`, `/symptom-checker`, `/reports`. There is no `/settings` page yet (“Settings — Soon” is disabled).
2. **Wrong port** — Check the terminal for `Local: http://localhost:XXXX`. Open that port, not an old tab on 3003/3004.
3. **Several `npm run dev` instances** — Stop all dev terminals (Ctrl+C), then run once:
   ```bash
   npm run dev:clean
   ```
4. **Corrupt `.next` cache** — `dev:clean` deletes `.next` and restarts; or manually delete the `.next` folder and run `npm run dev` again.

After editing `.env.local`, **restart** the dev server so Next.js picks up the new key.

## Production build check

```bash
npm run build
npm start
```

## Project folders (beginner map)

```
app/          → Pages and API routes
components/   → Reusable UI (ui, layout, dashboard, healthcare)
features/     → Feature logic (forms, scanners, OCR)
data/         → Mock demo data
lib/          → OpenAI, env helpers, utilities
types/        → TypeScript types
```

## Phase 1 checklist

- [ ] `npm install` completes
- [ ] `npm run dev` starts without errors
- [ ] All 7 routes open in the browser
- [ ] Light/dark theme toggle works
- [ ] Mobile layout looks correct on a narrow viewport
- [ ] `.env.local.example` copied when ready for live AI (Phase 5)

## Next phase

**Phase 4** — Health dashboard and analytics polish ✅ — [DASHBOARD.md](./DASHBOARD.md)

**Phase 5** — AI Symptom Checker polish ✅ — [SYMPTOM-CHECKER.md](./SYMPTOM-CHECKER.md)

**Phase 6** — Prescription OCR Reader polish ✅ — [PRESCRIPTION-OCR.md](./PRESCRIPTION-OCR.md)

**Phase 7** — Smart Medicine Scanner polish ✅ — [BARCODE-SCANNER.md](./BARCODE-SCANNER.md)

**Phase 8** — Emergency SOS simulation polish ✅ — [EMERGENCY-SOS.md](./EMERGENCY-SOS.md).

**Phase 9** — Reports, accessibility, responsiveness, and demo reliability ✅ — [POLISH-QA.md](./POLISH-QA.md).

**Phase 10** — README, demo script, future roadmap, screenshots, and final presentation polish ✅ — [DEMO-SCRIPT.md](./DEMO-SCRIPT.md), [DEPLOYMENT.md](./DEPLOYMENT.md), [FUTURE-ROADMAP.md](./FUTURE-ROADMAP.md).

Homepage guide (Phase 3): [HOMEPAGE.md](./HOMEPAGE.md)

Design system reference (Phase 2): [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md)

See the full 12-phase roadmap in the project README.
