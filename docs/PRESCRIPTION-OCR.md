# MediNova-AI — Phase 6 Prescription OCR Reader

Phase 6 polishes `/prescription-reader` with browser-side Tesseract.js OCR, loading states, structured medicine extraction, and strong verification warnings.

## Page layout (`/prescription-reader`)

| Area | Component | Purpose |
|------|-----------|---------|
| Header | `PageHeader` + `DisclaimerBanner` | Title and pharmacist verification notice |
| Upload column | `PrescriptionUploader` | Image upload, samples, OCR trigger |
| Samples | `PrescriptionSampleChips` | Instant demo without upload |
| Results column | `OCRAnalysisLoading` / `OCRResults` / `EmptyState` | Progress, results, or placeholder |

## OCR flow

1. User uploads PNG/JPG/WEBP (max 10 MB) or taps a sample chip.
2. **Sample** → `getDemoOCRResult()` runs instantly (no Tesseract).
3. **Upload** → `Tesseract.recognize()` runs in the browser with progress callbacks.
4. `cleanOCRText()` normalizes line breaks.
5. `extractMedicineNames()` returns `DetectedMedicine[]` with name, dosage hint, and confidence.
6. Results show verification banner, numbered medicines, collapsible raw text.

## Key files

- [features/prescription-reader/PrescriptionUploader.tsx](../features/prescription-reader/PrescriptionUploader.tsx) — upload validation, OCR trigger
- [features/prescription-reader/PrescriptionReaderClient.tsx](../features/prescription-reader/PrescriptionReaderClient.tsx) — two-column layout, loading in results panel
- [features/prescription-reader/OCRResults.tsx](../features/prescription-reader/OCRResults.tsx) — verification warning, medicine cards, raw text
- [features/prescription-reader/ocr.helpers.ts](../features/prescription-reader/ocr.helpers.ts) — text cleaning and medicine extraction
- [data/prescriptionSamples.ts](../data/prescriptionSamples.ts) — demo prescription text presets

## Phase 6 checklist

- [ ] Upload accepts PNG/JPG/WEBP and rejects oversized files
- [ ] Sample chips show instant demo results without upload
- [ ] Loading card appears in results column during live OCR
- [ ] Progress bar updates while Tesseract runs
- [ ] Detected medicines show confidence badges
- [ ] Verification warning is visible before medicine list
- [ ] Raw OCR text can be copied and expanded
- [ ] Privacy note: processing stays in the browser

## Privacy & safety

- Images are **not** sent to a server in this demo.
- OCR accuracy varies with handwriting and photo quality.
- Always verify medicines with a licensed pharmacist or doctor.

## Next phase

**Phase 7** — Smart Medicine Scanner polish ✅ — see [BARCODE-SCANNER.md](./BARCODE-SCANNER.md).

**Phase 8** — Emergency SOS simulation polish ✅ — see [EMERGENCY-SOS.md](./EMERGENCY-SOS.md).

**Phase 9** — Reports, accessibility, responsiveness, and demo reliability.

See [SYMPTOM-CHECKER.md](./SYMPTOM-CHECKER.md) for Phase 5 and [SETUP.md](./SETUP.md) for troubleshooting.
