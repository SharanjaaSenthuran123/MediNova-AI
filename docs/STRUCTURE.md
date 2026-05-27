# MediNova-AI Project Structure

Beginner-friendly guide to where code lives and why.

## Architecture at a glance

```
User → app/ (routes) → features/ (logic) → components/ (UI)
                              ↓
                         lib/ + data/ + types/
                              ↓
                         app/api/ (server)
```

**Golden rule:** Pages stay thin. Feature logic lives in `features/`. Reusable visuals live in `components/`. Shared helpers live in `lib/`.

---

## Folder map

| Folder | Purpose | Put here |
|--------|---------|----------|
| `app/` | Next.js routes only | `page.tsx`, `layout.tsx`, API routes |
| `app/(dashboard)/` | Dashboard-shell routes (URLs unchanged) | symptom checker, dashboard, OCR, etc. |
| `features/` | Interactive feature logic | forms, scanners, client state, `*.helpers.ts` |
| `components/ui/` | Design system | Button, Card, SampleChips, FeatureLoadingCard |
| `components/layout/` | Shell & navigation | Navbar, Sidebar, FeaturePageShell |
| `components/dashboard/` | Dashboard widgets | StatCard, HealthChart |
| `components/homepage/` | Landing page sections | Hero, Features, CTA |
| `components/healthcare/` | Medical display cards | SymptomResultCard, MedicineCard |
| `lib/` | Shared utilities | format, env, OpenAI, auth, db |
| `lib/api/` | API helpers | `client.ts`, `require-user.ts` |
| `lib/schemas/` | Zod validation | symptom, user, integration schemas |
| `lib/auth/` | Session helpers | cookie-based demo auth |
| `lib/db/` | Demo JSON store | user profiles & history |
| `data/` | Static mock data | dashboard stats, sample barcodes |
| `types/` | TypeScript interfaces | domain models |
| `hooks/` | Reusable React hooks | `useConfigStatus` |

---

## Route groups

Dashboard pages share one layout via **`app/(dashboard)/layout.tsx`**.

The `(dashboard)` folder name does **not** appear in URLs:

| File path | URL |
|-----------|-----|
| `app/(dashboard)/dashboard/page.tsx` | `/dashboard` |
| `app/(dashboard)/symptom-checker/page.tsx` | `/symptom-checker` |

Public pages (home, how-it-works) stay in `app/` without the dashboard shell.

---

## Feature module pattern

Each feature folder follows the same shape:

```
features/symptom-checker/
  SymptomCheckerClient.tsx   ← orchestrator (state + layout)
  SymptomForm.tsx            ← user input
  SymptomExampleChips.tsx    ← thin wrapper → SampleChips
  SymptomAnalysisLoading.tsx ← thin wrapper → FeatureLoadingCard
```

**Add a new feature:**

1. Create `features/my-feature/MyFeatureClient.tsx`
2. Add `app/(dashboard)/my-feature/page.tsx` using `FeaturePageShell`
3. Add nav link in `lib/constants.ts` → `SIDEBAR_LINKS`
4. Add types in `types/` and mock data in `data/` if needed

---

## Shared utilities

### `lib/format.ts`
Date/time formatting for history, reminders, timelines.

```ts
import { formatDateTime } from "@/lib/format";
```

### `lib/api/client.ts`
Typed fetch wrapper for feature clients.

```ts
import { apiPost } from "@/lib/api/client";
const data = await apiPost("/api/reminders", payload);
```

### `lib/api/require-user.ts`
Server-side auth guard for API routes.

```ts
const auth = await requireUser();
if (!auth.ok) return auth.response;
const { userId, record } = auth;
```

### `lib/schemas/`
All Zod schemas. Old paths (`lib/user-schema.ts`) re-export for compatibility.

---

## UI building blocks

| Component | Use for |
|-----------|---------|
| `FeaturePageShell` | Standard tool page: header + disclaimer + content |
| `SampleChips` | One-tap demo presets (symptoms, barcodes, OCR) |
| `FeatureLoadingCard` | AI/OCR/scan loading states |
| `EmptyState` | Before user interaction |
| `DisclaimerBanner` | Safety / demo warnings |

---

## Data flow

### AI Symptom Checker
```
SymptomForm → POST /api/symptom-checker → lib/openai.ts → SymptomResultCard
```

### Prescription OCR
```
PrescriptionUploader → Tesseract.js (browser) → ocr.helpers.ts → OCRResults
```

### Authenticated features
```
ProfileClient → POST /api/user → lib/db/store.ts → JSON file
HistoryClient → GET /api/history → requireUser() → user record
```

---

## What goes where (quick decisions)

| Question | Answer |
|----------|--------|
| Is it a URL? | `app/` |
| Is it feature-specific state/logic? | `features/<name>/` |
| Is it reused on 2+ pages? | `components/` |
| Is it a pure function / server helper? | `lib/` |
| Is it static demo content? | `data/` |
| Is it a TypeScript type? | `types/` |
| Is it a React hook? | `hooks/` |

---

## Import convention

Always use the `@/` alias:

```ts
import { Button } from "@/components/ui/Button";
import { symptomExamples } from "@/data/symptomExamples";
import type { Medicine } from "@/types/medicine";
```

Never use relative paths like `../../components`.

---

## Related docs

- [SETUP.md](./SETUP.md) — install & run
- [BACKEND.md](./BACKEND.md) — demo auth & persistence
- Feature guides: `SYMPTOM-CHECKER.md`, `BARCODE-SCANNER.md`, etc.
