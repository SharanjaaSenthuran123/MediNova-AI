# MediNova-AI — Screenshots Guide

Capture screenshots for your README, slide deck, or hackathon submission. Store files in [`public/screenshots/`](../public/screenshots/) so they can be referenced as `/screenshots/filename.png` in the README.

---

## Recommended captures

| File name | Route | What to show |
|-----------|-------|--------------|
| `homepage-hero.png` | `/` | Hero section with CTAs (desktop, light mode) |
| `homepage-features.png` | `/#features` | Five core feature cards |
| `homepage-roadmap.png` | `/#roadmap` | Future roadmap grid with Coming soon badges |
| `symptom-checker-result.png` | `/symptom-checker` | Form + AI result card with urgency banner |
| `prescription-ocr.png` | `/prescription-reader` | Sample prescription + detected medicines |
| `barcode-scanner.png` | `/barcode-scanner` | Smart Medicine Scanner — photo analysis & expiry badge |
| `emergency-sos.png` | `/emergency` | Alert timeline after quick demo |
| `dashboard.png` | `/dashboard` | Full dashboard with charts (desktop) |
| `reports.png` | `/reports` | Stats row + expanded report card |
| `mobile-dashboard.png` | `/dashboard` | Mobile width with bottom nav (375px) |

---

## How to capture

### Option A — Browser (fastest)

1. Run `npm run dev:reset`
2. Open each route at **1280×800** (desktop) or **375×812** (mobile via DevTools)
3. Use OS screenshot or browser DevTools → Capture screenshot
4. Save to `public/screenshots/` using the file names above

### Option B — Windows Snipping Tool

1. `Win + Shift + S` → select region
2. Save as PNG into `public/screenshots/`

### Option C — Screen recording

For live demos, record a 60–90 second walkthrough following [DEMO-SCRIPT.md](./DEMO-SCRIPT.md). Upload to YouTube/Loom and link from README.

---

## README embed example

After saving images:

```markdown
## Screenshots

| Homepage | Symptom Checker |
|----------|-----------------|
| ![Homepage](/screenshots/homepage-hero.png) | ![Symptom Checker](/screenshots/symptom-checker-result.png) |

| Dashboard | Emergency SOS |
|-----------|-----------------|
| ![Dashboard](/screenshots/dashboard.png) | ![Emergency](/screenshots/emergency-sos.png) |
```

---

## Tips for judge-ready visuals

- Use **light mode** for projectors unless the room is dark
- Hide browser bookmarks bar
- Use demo data (sample chips) for consistent results
- Capture **after** `npm run build` succeeds so UI matches production
- Include at least one **mobile** screenshot to show responsiveness

---

## Placeholder until captures exist

If you have not captured images yet, the README links to this guide. Add PNGs to `public/screenshots/` when ready — no code changes required beyond dropping files in the folder.
