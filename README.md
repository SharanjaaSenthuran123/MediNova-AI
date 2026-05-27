# MediNova-AI

**AI Powered Smart Healthcare Ecosystem** — a Next.js healthcare demo that connects AI symptom guidance, prescription OCR, smart medicine scanning, emergency SOS simulation, and health analytics in one polished hackathon-ready product.

> **Educational demo only.** Not a medical diagnosis tool. Emergency SOS is a simulation unless integrated with real alert providers.

---

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Full setup: **[docs/SETUP.md](docs/SETUP.md)**

```bash
cp .env.local.example .env.local   # optional — OpenAI for live AI
```

Without `OPENAI_API_KEY`, the Symptom Checker uses smart demo fallback so presentations never break.

---

## 3-minute demo script

Follow **[docs/DEMO-SCRIPT.md](docs/DEMO-SCRIPT.md)** for a judge-ready walkthrough:

1. **Homepage** — pitch + five live features + future roadmap
2. **Symptom Checker** — example chips → AI result with urgency
3. **Prescription OCR** — sample chip → Tesseract extraction
4. **Smart Medicine Scanner** — upload a photo or enter code `8901234567890` → medicine details
5. **Emergency SOS** — quick demo → replayable timeline
6. **Dashboard & Reports** — charts, filters, deep-linked reports

---

## Live features

| Route | Feature | Tech |
|-------|---------|------|
| `/` | Landing page + roadmap vision | Next.js, Tailwind |
| `/symptom-checker` | AI symptom analysis | OpenAI + demo fallback |
| `/prescription-reader` | Prescription OCR | Tesseract.js (browser) |
| `/barcode-scanner` | Smart Medicine Scanner | @zxing/browser + OpenAI Vision |
| `/emergency` | SOS simulation | Timeline + replay |
| `/dashboard` | Health analytics | Chart.js + mock data |
| `/reports` | Filterable health records | Expandable demo reports |
| `/profile` | User profile & emergency contacts | Cookie session + JSON store |
| `/history` | Saved symptom, OCR, and scan history | Auto-save from features |
| `/assistant` | AI health assistant chat | OpenAI + symptom context |
| `/reminders` | Smart medicine reminders | History-based suggestions |
| `/appointments` | Doctor appointment booking | Demo scheduling UI |

---

## Screenshots

Add PNGs to [`public/screenshots/`](public/screenshots/) — see **[docs/SCREENSHOTS.md](docs/SCREENSHOTS.md)** for capture steps.

| Homepage | Symptom Checker | Dashboard |
|----------|-----------------|-----------|
| *Add `homepage-hero.png`* | *Add `symptom-checker-result.png`* | *Add `dashboard.png`* |

---

## Tech stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS v3
- **AI:** OpenAI API (optional)
- **OCR:** Tesseract.js (browser)
- **Charts:** Chart.js + react-chartjs-2
- **Barcode:** @zxing/browser
- **Icons:** Lucide React
- **Theme:** next-themes

---

## Environment variables

```env
OPENAI_API_KEY=sk-your-key-here    # optional
OPENAI_MODEL=gpt-4o-mini           # optional
```

---

## Deploy

Deploy to Vercel in minutes — **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**

```bash
npm run build
npm run start
```

---

## Future roadmap

Homepage **Product roadmap** section highlights Phase 12 live integrations (assistant, reminders, appointments, wearables). Full plan: **[docs/FUTURE-ROADMAP.md](docs/FUTURE-ROADMAP.md)**

---

## API routes

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/api/symptom-checker` | AI analysis (OpenAI or demo) |
| `GET` | `/api/medicine-lookup?barcode=` | Mock medicine lookup |
| `POST` | `/api/emergency-alert` | Simulated emergency response |
| `GET/POST/PATCH` | `/api/user` | Demo profile + session |
| `GET` | `/api/history` | Activity history |
| `POST` | `/api/history/symptoms` | Save symptom check |
| `POST` | `/api/history/prescriptions` | Save OCR result |
| `POST` | `/api/history/barcodes` | Save barcode lookup |
| `GET/PUT` | `/api/user/contacts` | Emergency contacts |
| `POST` | `/api/assistant` | AI health assistant chat |
| `GET/POST/PATCH/DELETE` | `/api/reminders` | Medicine reminders |
| `GET/POST/PATCH` | `/api/appointments` | Appointment booking |
| `GET/POST/DELETE` | `/api/wearables` | Wearable sync simulation |

---

## Project structure

```
app/
  (dashboard)/       # Shared DashboardLayout — URLs unchanged (/dashboard, /symptom-checker, …)
  api/               # Server routes
  page.tsx           # Public homepage
components/
  ui/                # Button, Card, SampleChips, FeatureLoadingCard, …
  layout/            # Navbar, Sidebar, FeaturePageShell, DashboardLayout
  homepage/          # Landing sections
  dashboard/         # Charts, stat cards, report widgets
  healthcare/        # SymptomResultCard, MedicineCard, …
features/            # Feature clients, forms, *.helpers.ts
hooks/               # useConfigStatus, …
lib/
  api/               # client.ts, require-user.ts
  schemas/           # Zod validation (symptom, user, integration)
  auth/              # Session helpers
  db/                # Demo JSON store
data/                # Mock demo data
types/               # TypeScript domain types
docs/                # Guides — start with STRUCTURE.md
```

**Full architecture guide:** **[docs/STRUCTURE.md](docs/STRUCTURE.md)**

---

## Documentation

| Doc | Purpose |
|-----|---------|
| [SETUP.md](docs/SETUP.md) | Install, env vars, troubleshooting |
| [STRUCTURE.md](docs/STRUCTURE.md) | Folder map, patterns, where to put new code |
| [DEMO-SCRIPT.md](docs/DEMO-SCRIPT.md) | 3-minute hackathon presentation |
| [PRESENTATION.md](docs/PRESENTATION.md) | Phase 10 overview & checklist |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Vercel deploy checklist |
| [BACKEND.md](docs/BACKEND.md) | Phase 11 profiles, history, APIs |
| [INTEGRATIONS.md](docs/INTEGRATIONS.md) | Phase 12 assistant, reminders, appointments |
| [FUTURE-ROADMAP.md](docs/FUTURE-ROADMAP.md) | Post-hackathon product vision |
| [POLISH-QA.md](docs/POLISH-QA.md) | Accessibility & QA checklist |
| [DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) | UI components & theme |
| Feature guides | SYMPTOM-CHECKER, PRESCRIPTION-OCR, BARCODE-SCANNER, EMERGENCY-SOS, DASHBOARD, HOMEPAGE |

---

## Development phases

Phases 1–12 of the hackathon roadmap are implemented:

| Phase | Focus | Status |
|-------|--------|--------|
| 1 | Setup & dev workflow | ✅ |
| 2 | Design system & layout | ✅ |
| 3 | Homepage & product story | ✅ |
| 4 | Health dashboard & analytics | ✅ |
| 5 | AI Symptom Checker | ✅ |
| 6 | Prescription OCR Reader | ✅ |
| 7 | Smart Medicine Scanner | ✅ |
| 8 | Emergency SOS simulation | ✅ |
| 9 | Reports, accessibility, polish | ✅ |
| 10 | README, demo script, deployment | ✅ |
| 11 | Backend, profiles & history | ✅ |
| 12 | AI assistant & integrations | ✅ |

---

## Disclaimer

MediNova-AI is for **educational and hackathon demo purposes only**. It does not provide medical diagnosis. OCR and barcode results must be verified with a pharmacist or doctor. Emergency SOS is a **simulation** unless integrated with real alert providers. Always consult qualified healthcare professionals.
