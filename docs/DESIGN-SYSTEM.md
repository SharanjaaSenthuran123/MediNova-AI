# MediNova-AI — Premium Design System

Glassmorphism, healthcare gradients, and smooth animations across the app.

## Visual language

- **Mesh background** — fixed radial gradients on `body` (teal, blue, cyan)
- **Glass panels** — `.glass` / `.glass-strong` with backdrop blur and inset highlight
- **Gradients** — `bg-gradient-primary`, `.text-gradient`, `.gradient-panel`
- **Motion** — `animate-fade-in-up`, `animate-float`, `animate-glow` (respects `prefers-reduced-motion`)

## Color palette

| Token | Hex | Use |
|-------|-----|-----|
| Primary (teal) | `#14b8a6` | Main actions, brand, healthy states |
| Secondary (blue) | `#2563eb` | Analytics, links |
| Accent (cyan) | `#06b6d4` | Highlights |
| Success | `#22c55e` | Normal vitals, taken medicines |
| Warning | `#f59e0b` | Caution, pending items |
| Danger | `#ef4444` | Emergency SOS, high risk only |

Use **red sparingly** — emergency and critical urgency only.

## Reusable UI (`components/ui/`)

| Component | Purpose |
|-----------|---------|
| `Button` | primary (gradient + glow), secondary, outline (glass), ghost, danger, glass |
| `Card` | **glass** (default), solid, elevated, gradient, flat — `interactive` for hover lift |
| `Badge` | Status chips |
| `Input` / `Textarea` / `Select` | Forms with label, hint, error |
| `FormError` | Inline validation / API errors |
| `FileUpload` | Prescription image upload |
| `LoadingSpinner` / `LoadingState` | AI, OCR, scan loading |
| `PageHeader` | Title + description + optional eyebrow + action |
| `SectionHeading` | Dashboard subsections |
| `DisclaimerBanner` | Medical / demo warnings |
| `EmptyState` | Placeholder result panels |
| `DemoModeBanner` | OpenAI not configured |

## Layout (`components/layout/`)

| Component | Purpose |
|-----------|---------|
| `Navbar` | Public pages — active link highlight |
| `Sidebar` | Desktop dashboard — left accent on active route |
| `MobileNav` | Bottom tabs — pill active state |
| `DashboardLayout` | Shell + `PageContainer` max-width |
| `PageContainer` | `max-w-7xl` centered content |
| `DemoModeNotice` | API key missing banner |

Active route logic lives in `lib/navigation.ts` → `isNavActive()`.

## Spacing conventions

- Page padding: `p-4 sm:p-6` (dashboard main)
- Cards: `rounded-2xl`, `p-6` default
- Section gap: `mb-6` between major blocks
- Form fields: `space-y-4` inside forms
- Grid gaps: `gap-4` (stats), `gap-6` (charts)

## Dark / light mode

- CSS variables in `app/globals.css` (`:root` and `.dark`)
- Toggle via `next-themes` + `ThemeToggle`
- Focus rings use `ring-offset-background` for both themes

## Phase 2 checklist

- [ ] Navbar highlights current page on desktop and mobile menu
- [ ] Sidebar shows teal left bar on active link
- [ ] Mobile bottom nav shows pill background when active
- [ ] All dashboard routes use `PageHeader` with eyebrow labels
- [ ] Forms use `Input`, `Textarea`, `Select` (not raw `<select>`)
- [ ] Cards use shared `Card` with consistent borders
- [ ] Light and dark mode readable on every route
- [ ] Resize to mobile width — no horizontal scroll on feature pages

## Next phase

**Phase 4** — Health dashboard and analytics polish ✅ — [DASHBOARD.md](./DASHBOARD.md)

**Phase 5** — AI Symptom Checker polish ✅ — [SYMPTOM-CHECKER.md](./SYMPTOM-CHECKER.md)

**Phase 6** — Prescription OCR Reader polish ✅ — [PRESCRIPTION-OCR.md](./PRESCRIPTION-OCR.md)

**Phase 7** — Smart Medicine Scanner polish ✅ — [BARCODE-SCANNER.md](./BARCODE-SCANNER.md)

**Phase 8** — Emergency SOS simulation polish ✅ — [EMERGENCY-SOS.md](./EMERGENCY-SOS.md)

**Phase 9** — Reports, accessibility, responsiveness, and demo reliability.

Homepage reference (Phase 3): [HOMEPAGE.md](./HOMEPAGE.md)
