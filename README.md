# MediNova-AI

AI Powered Smart Healthcare Ecosystem — a modern healthcare web app built with Next.js, Tailwind CSS, and a beginner-friendly modular architecture.

## Phase 1 Complete

Phase 1 delivers the product foundation:

- Next.js 15 + TypeScript + Tailwind CSS v3
- Healthcare color theme with light/dark mode
- Reusable UI components (Button, Card, Badge, Input, ThemeToggle, etc.)
- Landing page (hero, features, dashboard preview, how-it-works, safety, CTA)
- Dashboard shell with sidebar, mobile nav, mock health stats
- Placeholder routes for upcoming features

## Phase 2 Complete

Phase 2 adds the core AI and analytics experience:

- **AI Symptom Checker** — form (symptoms, age, gender, duration, severity), secure `/api/symptom-checker` route, OpenAI integration with smart demo fallback
- **Structured results** — possible conditions, urgency badge, suggestions, when to seek care, disclaimer
- **Chart.js dashboard** — heart rate line chart, sleep bar chart, medicine adherence chart, AI insight card

## Phase 3 Complete

Phase 3 adds interactive demo features for prescriptions, medicines, and emergencies:

- **Prescription OCR Reader** — image upload/drag-drop, Tesseract.js in-browser OCR with progress bar, raw text + detected medicine cards
- **Barcode Scanner** — camera scanning with animated frame, manual barcode fallback, mock medicine lookup (dosage, warnings, expiry)
- **Emergency SOS Simulation** — large SOS button with 5s countdown, simulated location, caretaker contacts, step-by-step alert timeline

## Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Theme:** next-themes

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/                 # Pages and layouts
components/
  layout/            # Navbar, Sidebar, Footer, DashboardLayout
  ui/                # Reusable UI primitives
  dashboard/         # Dashboard widgets
  healthcare/        # Healthcare-specific cards
  providers/         # Theme provider
data/                # Mock data
lib/                 # Utils and constants
types/               # TypeScript types
features/            # Feature modules (Phase 2+)
```

## Environment Variables

Copy `.env.local.example` to `.env.local` when you reach Phase 2 (OpenAI Symptom Checker):

```
OPENAI_API_KEY=your_key_here
```

## Roadmap

| Phase | Focus |
|-------|--------|
| 1 | Foundation, branding, homepage, dashboard shell |
| 2 | AI Symptom Checker + Chart.js analytics ✅ |
| 3 | Prescription OCR, barcode scanner, emergency SOS ✅ |
| 4 | Polish, deployment, demo script |

## Disclaimer

MediNova-AI is for educational and hackathon demo purposes. It is not a medical diagnosis tool. Always consult qualified healthcare professionals.
