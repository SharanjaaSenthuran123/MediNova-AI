# MediNova-AI — Phase 4 Dashboard

Phase 4 turns `/dashboard` into a **professional healthcare analytics control center** with modular components, Chart.js trends, and linked reports.

## Dashboard layout (`/dashboard`)

| Section | Component | Purpose |
|---------|-----------|---------|
| Header | `PageHeader` | Title, symptom-check CTA |
| Disclaimer | `DisclaimerBanner` | Mock data notice |
| Patient summary | `PatientSummaryCard` | Avatar, health score, risk ring |
| Stats grid | `DashboardStatsGrid` | Heart rate, sleep, adherence, risk |
| Quick links | `DashboardQuickLinks` | Jump to core demo features |
| Emergency | `EmergencyContactCard` | SOS contacts + link to `/emergency` |
| Trends | `HealthTrendsSection` | Heart rate, sleep, adherence charts |
| Today | `MedicineScheduleCard` | Daily medicine schedule |
| Reports | `RecentReportsCard` | Preview with link to `/reports` |
| AI insight | `AIHealthInsightCard` | Connected insight + symptom CTA |

## Reports page (`/reports`)

- Stat summary row (total, normal, review, complete)
- Status and category filter chips with empty state
- Expandable report cards with provider and key findings
- Deep links from dashboard: `/reports?report={id}`
- **Back to Dashboard** action in page header
- Shares `recentReports` data from [data/dashboardStats.ts](../data/dashboardStats.ts)

## Data files

- [data/dashboardStats.ts](../data/dashboardStats.ts) — patient, stats, reports, medicines, emergency contacts
- [data/chartData.ts](../data/chartData.ts) — chart series and AI insight text

## Phase 4 checklist

- [ ] Patient summary shows health score and risk visualization
- [ ] Four stat cards with status badges
- [ ] Quick links to Symptom Checker, OCR, barcode, SOS
- [ ] Emergency contacts card with active status
- [ ] Three Chart.js charts (heart rate, sleep, adherence)
- [ ] Medicine schedule shows taken/pending counts
- [ ] Recent reports preview links to `/reports`
- [ ] AI insight card links to symptom checker
- [ ] Reports page shows summaries and back navigation
- [ ] Dashboard is responsive on mobile (no horizontal scroll)

## Next phase

**Phase 5** — AI Symptom Checker polish ✅ — see [SYMPTOM-CHECKER.md](./SYMPTOM-CHECKER.md).

**Phase 6** — Prescription OCR Reader polish ✅ — see [PRESCRIPTION-OCR.md](./PRESCRIPTION-OCR.md).

**Phase 7** — Smart Medicine Scanner polish ✅ — [BARCODE-SCANNER.md](./BARCODE-SCANNER.md).

**Phase 8** — Emergency SOS simulation polish ✅ — [EMERGENCY-SOS.md](./EMERGENCY-SOS.md).

**Phase 9** — Reports, accessibility, responsiveness, and demo reliability ✅ — [POLISH-QA.md](./POLISH-QA.md).

**Phase 10** — README, demo script, future roadmap, screenshots, and final presentation polish ✅ — [DEMO-SCRIPT.md](./DEMO-SCRIPT.md), [DEPLOYMENT.md](./DEPLOYMENT.md).

See [HOMEPAGE.md](./HOMEPAGE.md) for Phase 3 and [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) for UI tokens.
