# MediNova-AI — Phase 5 AI Symptom Checker

Phase 5 makes `/symptom-checker` the **main AI demo feature** with validation, loading states, smart fallback, and polished result cards.

## Page layout (`/symptom-checker`)

| Area | Component | Purpose |
|------|-----------|---------|
| Header | `PageHeader` | Title and educational disclaimer |
| Form column | `SymptomForm` | Symptoms, profile fields, submit |
| Examples | `SymptomExampleChips` | One-tap demo symptom presets |
| Results column | `SymptomAnalysisLoading` / `SymptomResultCard` / `EmptyState` | Loading, results, or placeholder |

## API flow

1. Browser `POST` → `/api/symptom-checker` (never calls OpenAI from the client).
2. Request validated with `symptomRequestSchema` in [lib/symptom-schema.ts](../lib/symptom-schema.ts).
3. If no API key → `getDemoSymptomResult()` with `demoMode: true`.
4. If API key → OpenAI JSON response validated with `symptomResultSchema`.
5. On OpenAI failure → smart demo fallback with explanatory `message`.

## Key files

- [features/symptom-checker/SymptomForm.tsx](../features/symptom-checker/SymptomForm.tsx) — form + client-side zod validation
- [features/symptom-checker/SymptomCheckerClient.tsx](../features/symptom-checker/SymptomCheckerClient.tsx) — two-column layout, loading in results panel
- [components/healthcare/SymptomResultCard.tsx](../components/healthcare/SymptomResultCard.tsx) — urgency banner, numbered conditions, emergency CTA
- [lib/symptom-fallback.ts](../lib/symptom-fallback.ts) — keyword-based demo responses
- [lib/openai.ts](../lib/openai.ts) — server-side OpenAI call
- [data/symptomExamples.ts](../data/symptomExamples.ts) — example chip labels and text

## Phase 5 checklist

- [ ] Example symptom chips fill the textarea
- [ ] Client validates before submit (min 3 chars, age 1–120)
- [ ] Loading card appears in results column while analyzing
- [ ] Demo mode works without `OPENAI_API_KEY`
- [ ] Live AI works with valid key in `.env.local`
- [ ] Urgency banner and `RiskBadge` match urgency level
- [ ] High/emergency results show Emergency SOS link
- [ ] Medical disclaimer always visible at bottom of results

## Environment

```env
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o-mini
```

Restart `npm run dev` after changing `.env.local`.

## Next phase

**Phase 6** — Prescription OCR Reader polish ✅ — [PRESCRIPTION-OCR.md](./PRESCRIPTION-OCR.md).

See [DASHBOARD.md](./DASHBOARD.md) for Phase 4 and [SETUP.md](./SETUP.md) for troubleshooting.
