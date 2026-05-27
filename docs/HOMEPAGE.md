# MediNova-AI — Phase 3 Homepage

Phase 3 turns the landing page into a **startup-style product story** that explains MediNova-AI before judges click anything.

## Homepage sections (`/`)

| Section | Component | Purpose |
|---------|-----------|---------|
| Hero | `HeroSection` | Headline, description, primary CTAs, quick links, dashboard mockup card |
| Trust strip | `TrustStrip` | AI-assisted, OCR ready, emergency simulation, dashboard analytics |
| Features | `FeaturesSection` | Five core feature cards linking to demo routes |
| Dashboard preview | `DashboardPreviewSection` | Stat cards, Chart.js preview, AI insight card |
| How it works | `HowItWorksSection` | Four-step product flow |
| Roadmap | `RoadmapSection` | Six coming-soon features with honest labels |
| Safety | `SafetySection` | Educational demo disclaimer |
| Final CTA | `FinalCTASection` | Dual buttons — Symptom Checker + Dashboard |

## Data files

- [data/homepageFeatures.ts](../data/homepageFeatures.ts) — feature cards, trust strip copy, how-it-works steps, hero quick links
- [data/futureFeatures.ts](../data/futureFeatures.ts) — roadmap cards for Phase 10 presentation
- [data/dashboardStats.ts](../data/dashboardStats.ts) — trust stat values, health stat cards
- [data/chartData.ts](../data/chartData.ts) — chart preview data and AI insight text

## CTAs

Primary actions repeated across the page:

1. **Start Health Check** → `/symptom-checker`
2. **View Dashboard** → `/dashboard`

Secondary quick links in hero: OCR Reader, Smart Medicine Scanner, Emergency SOS.

## Phase 3 checklist

- [ ] Hero shows split layout on desktop with dashboard mockup card
- [ ] Trust strip lists four product capabilities with icons
- [ ] Feature grid shows exactly five core tools (no filler cards)
- [ ] Dashboard preview includes stat cards, line chart, and AI insight
- [ ] How-it-works section has four clear steps
- [ ] Roadmap section shows six coming-soon features
- [ ] Safety disclaimer is visible before final CTA
- [ ] Final CTA offers both Symptom Checker and Dashboard
- [ ] Navbar and footer link to `#features` and `#how-it-works`
- [ ] Page is responsive at mobile width with no horizontal scroll

## Next phase

**Phase 4** — Health dashboard and analytics polish ✅ — see [DASHBOARD.md](./DASHBOARD.md).

**Phase 5** — AI Symptom Checker polish ✅ — [SYMPTOM-CHECKER.md](./SYMPTOM-CHECKER.md).

**Phase 6** — Prescription OCR Reader polish ✅ — [PRESCRIPTION-OCR.md](./PRESCRIPTION-OCR.md).

**Phase 7** — Smart Medicine Scanner polish ✅ — [BARCODE-SCANNER.md](./BARCODE-SCANNER.md).

**Phase 8** — Emergency SOS simulation polish ✅ — [EMERGENCY-SOS.md](./EMERGENCY-SOS.md).

**Phase 9** — Reports, accessibility, responsiveness, and demo reliability ✅ — [POLISH-QA.md](./POLISH-QA.md).

**Phase 10** — README, demo script, future roadmap, screenshots, and final presentation polish ✅ — [DEMO-SCRIPT.md](./DEMO-SCRIPT.md), [DEPLOYMENT.md](./DEPLOYMENT.md).

See [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) for UI tokens from Phase 2.
