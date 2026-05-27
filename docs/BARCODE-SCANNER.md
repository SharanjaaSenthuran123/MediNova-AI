# MediNova-AI — Phase 7 Smart Medicine Scanner

Phase 7 polishes `/barcode-scanner` with photo upload, OpenAI Vision analysis, manual barcode entry, demo chips, API lookup, loading states, and expiry-aware medicine details.

## Page layout (`/barcode-scanner`)

| Area | Component | Purpose |
|------|-----------|---------|
| Header | `PageHeader` + `DisclaimerBanner` | Title and demo-data notice |
| Scanner column | `BarcodeScanner` | Camera, manual entry, demo chips |
| Samples | `BarcodeSampleChips` | One-tap demo without camera |
| Results column | `BarcodeLookupLoading` / `MedicineDetails` / `EmptyState` | Loading, details, or placeholder |

## Lookup flow

1. User starts camera, enters a barcode manually, or taps a demo chip.
2. Client calls `GET /api/medicine-lookup?barcode=...`.
3. API validates with zod and searches [data/medicines.ts](../data/medicines.ts).
4. **Found** → `MedicineCard` with dosage, warnings, manufacturer, expiry badge.
5. **Not found** → helpful empty state with known demo barcodes listed.

## Expiry status

[lib/medicine-helpers.ts](../lib/medicine-helpers.ts) calculates:

| Status | Rule |
|--------|------|
| `expired` | Expiry date is before today |
| `expiring_soon` | Within 60 days of expiry |
| `valid` | More than 60 days remaining |

Demo data includes an expired Omeprazole record and a Metformin record expiring soon.

## Key files

- [features/barcode-scanner/BarcodeScanner.tsx](../features/barcode-scanner/BarcodeScanner.tsx) — camera + manual entry
- [features/barcode-scanner/BarcodeScannerClient.tsx](../features/barcode-scanner/BarcodeScannerClient.tsx) — two-column layout, loading in results panel
- [features/barcode-scanner/MedicineDetails.tsx](../features/barcode-scanner/MedicineDetails.tsx) — verification banner, not-found help
- [features/barcode-scanner/lookup.helpers.ts](../features/barcode-scanner/lookup.helpers.ts) — API client
- [data/barcodeSamples.ts](../data/barcodeSamples.ts) — demo barcode presets
- [app/api/medicine-lookup/route.ts](../app/api/medicine-lookup/route.ts) — GET and POST lookup

## Phase 7 checklist

- [ ] Camera permission UI explains fallback options
- [ ] Manual barcode entry works with Enter key
- [ ] Demo chips trigger instant lookup without camera
- [ ] Loading card appears in results column during lookup
- [ ] Medicine details show dosage, warnings, manufacturer
- [ ] Expiry badges show valid / expiring soon / expired
- [ ] Not-found state lists known demo barcodes
- [ ] Verification warning visible before medicine card

## Demo barcodes

| Label | Barcode | Notes |
|-------|---------|-------|
| Paracetamol | `8901234567890` | Valid expiry |
| Amoxicillin | `8901234567891` | Valid expiry |
| Metformin | `8901234567893` | Expiring soon |
| Expired demo | `8901234567892` | Omeprazole — expired |

## Privacy & safety

- Camera runs in the browser via `@zxing/browser`.
- Lookup uses mock demo data only — not a real drug database.
- Always verify medicine labels with a licensed pharmacist.

## Next phase

**Phase 8** — Emergency SOS simulation polish ✅ — see [EMERGENCY-SOS.md](./EMERGENCY-SOS.md).

**Phase 9** — Reports, accessibility, responsiveness, and demo reliability.

See [PRESCRIPTION-OCR.md](./PRESCRIPTION-OCR.md) for Phase 6 and [SETUP.md](./SETUP.md) for troubleshooting.
