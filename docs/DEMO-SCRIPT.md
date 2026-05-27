# MediNova-AI — Hackathon Demo Script

A **3-minute judge demo** that highlights what works today and ends with the product vision. Practice once with `npm run dev:reset` so the app is warm and no stale cache errors appear.

**Total time:** ~3 minutes · **Audience:** hackathon judges · **Mode:** works with or without `OPENAI_API_KEY`

---

## Before you present

1. Run `npm run dev:reset` and open [http://localhost:3000](http://localhost:3000).
2. Optional: add `OPENAI_API_KEY` to `.env.local` for live AI on the Symptom Checker.
3. Have these demo shortcuts ready:
   - Symptom chips: tap **fever**, **headache**, **cough**
   - Prescription OCR: use a **sample prescription chip** (no upload needed)
   - Barcode: enter **`8901234567890`** or tap a demo barcode chip
   - Emergency: use **Quick demo for judges** (shorter countdown)

---

## Minute 0:00 — Homepage pitch (30 sec)

**Route:** `/`

**Say:**

> "MediNova-AI is an AI-powered smart healthcare ecosystem. One platform for symptom guidance, prescription reading, medicine verification, emergency safety, and health analytics — built as a connected demo you can explore in minutes."

**Show:**

- Hero headline and dual CTAs
- Scroll briefly through **Core healthcare features** (five cards)
- Point at **Future roadmap** — "These are honestly labeled coming soon; today's demo covers the five live features."

---

## Minute 0:30 — AI Symptom Checker (45 sec)

**Route:** `/symptom-checker`

**Say:**

> "Our main AI feature takes symptoms and patient context, calls OpenAI on the server — never from the browser — and returns possible conditions, urgency, and when to see a doctor. Without an API key, smart demo fallback keeps the presentation reliable."

**Do:**

1. Tap example chips: **fever**, **headache**, **cough**
2. Set age **28**, duration **2 days**, severity **moderate**
3. Click **Analyze symptoms**
4. Highlight: urgency banner, conditions list, **Live AI** or **Demo** badge, disclaimer

---

## Minute 1:15 — Prescription OCR (30 sec)

**Route:** `/prescription-reader`

**Say:**

> "Prescription OCR runs entirely in the browser with Tesseract.js — no server upload. We extract likely medicine names and always warn users to verify with a pharmacist."

**Do:**

1. Click a **sample prescription chip** (instant demo)
2. Point at progress state, detected medicines, and verification warning

---

## Minute 1:45 — Smart Medicine Scanner (30 sec)

**Route:** `/barcode-scanner`

**Say:**

> "Camera scanning works on mobile; for laptop demos we always provide manual entry and sample barcodes so nothing breaks on stage."

**Do:**

1. Enter barcode **`8901234567890`** (or tap demo chip)
2. Show medicine details: dosage, warnings, expiry badge

---

## Minute 2:15 — Emergency SOS simulation (30 sec)

**Route:** `/emergency`

**Say:**

> "Emergency SOS is clearly a simulation — no real 911 or SMS — but it shows the product concept: countdown, location capture, caretaker notification, and an alert timeline judges can replay."

**Do:**

1. Select **Quick demo for judges**
2. Let countdown finish (or cancel once to show safety)
3. Show timeline, location card, **Notified** badges on contacts
4. Click **Run again** to prove replayability

---

## Minute 2:45 — Dashboard & reports (15 sec)

**Route:** `/dashboard` → `/reports`

**Say:**

> "Everything connects to a health dashboard — vitals, charts, medicine schedule, and filterable reports. Mock data today; API-backed in a future phase."

**Do:**

1. Scan dashboard: health score, charts, recent reports
2. Click a recent report → opens `/reports?report=id` expanded
3. Optional: filter by **Review** status

---

## Closing line (15 sec)

**Route:** `/` or stay on dashboard

**Say:**

> "MediNova-AI is demo-ready today with five connected tools. Next we add user profiles, reminders, wearables, and a full AI assistant — all scoped in our roadmap. Questions?"

---

## Backup plan (if something fails)

| Issue | Fallback |
|-------|----------|
| OpenAI error / no key | Symptom Checker still shows **Demo** results — mention intentional fallback |
| Camera denied | Barcode manual entry + demo chips |
| OCR slow | Use sample prescription chip instead of upload |
| Dev server crash | Run `npm run dev:reset` (documented in SETUP.md) |
| Judge on phone | Mobile nav + responsive layout already built |

---

## One-page cheat sheet

```
/                    → Pitch + features + roadmap
/symptom-checker     → Chips → Analyze → Result card
/prescription-reader → Sample chip → OCR results
/barcode-scanner     → 8901234567890 → Medicine card
/emergency           → Quick demo → Timeline → Replay
/dashboard           → Charts + reports link
/reports             → Filters + expand key findings
```

---

## Related docs

- [SETUP.md](./SETUP.md) — install, env vars, troubleshooting
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Vercel deploy checklist
- [FUTURE-ROADMAP.md](./FUTURE-ROADMAP.md) — what comes after the hackathon
- [SCREENSHOTS.md](./SCREENSHOTS.md) — capture images for README/slides
