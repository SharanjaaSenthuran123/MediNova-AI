# MediNova-AI — Phase 8 Emergency SOS Simulation

Phase 8 polishes `/emergency` with a countdown SOS button, API-backed alert simulation, location sharing, caretaker/SMS/email timeline, contact notification badges, and a replayable demo flow.

## Page layout (`/emergency`)

| Area | Component | Purpose |
|------|-----------|---------|
| Header | `PageHeader` + `DisclaimerBanner` | Title and simulation-only notice |
| Left column | `SOSButton` + `EmergencyDemoChips` | Countdown trigger and demo scenarios |
| Contacts | `EmergencyCard` | Caretaker, physician, hospital with notified badges |
| Right column | `EmergencyAlertLoading` / `AlertSimulation` / `EmptyState` | Loading, timeline, or placeholder |

## Alert flow

1. User taps **SOS** (5-second countdown) or **Quick demo** (instant, no countdown).
2. Client calls `POST /api/emergency-alert`.
3. API returns simulated location and notified contacts (800 ms delay).
4. **`EmergencyAlertLoading`** appears in the results column.
5. **`AlertSimulation`** runs a 4-step timeline with timestamps:
   - Detecting location
   - Notifying primary caretaker (SMS & push)
   - Alerting emergency services (simulated dispatch)
   - Sending email alert to care team
6. On completion, notification summary and **Replay simulation** button appear.
7. Contact cards show **Notified** badges with channel tags.

## Demo scenarios

| Scenario | Behavior |
|----------|----------|
| Standard SOS | Highlights chip; user taps SOS for 5-second countdown |
| Quick demo | Skips countdown — instant API call and timeline (for judges) |

## Key files

- [features/emergency/EmergencyClient.tsx](../features/emergency/EmergencyClient.tsx) — two-column layout, phase state machine
- [features/emergency/SOSButton.tsx](../features/emergency/SOSButton.tsx) — countdown with cancel
- [features/emergency/AlertSimulation.tsx](../features/emergency/AlertSimulation.tsx) — timeline, location, replay
- [features/emergency/EmergencyAlertLoading.tsx](../features/emergency/EmergencyAlertLoading.tsx) — API activation loading
- [features/emergency/EmergencyDemoChips.tsx](../features/emergency/EmergencyDemoChips.tsx) — scenario chips
- [features/emergency/SimulatedLocationCard.tsx](../features/emergency/SimulatedLocationCard.tsx) — GPS demo card with map link
- [features/emergency/alert.helpers.ts](../features/emergency/alert.helpers.ts) — API client
- [data/emergencyContacts.ts](../data/emergencyContacts.ts) — demo contacts and location
- [data/emergencyScenarios.ts](../data/emergencyScenarios.ts) — scenario presets
- [app/api/emergency-alert/route.ts](../app/api/emergency-alert/route.ts) — POST simulation + GET health check

## Phase 8 checklist

- [ ] SOS button shows 5-second countdown with cancel
- [ ] Quick demo chip skips countdown for presentations
- [ ] Loading card appears in results column during API call
- [ ] Timeline shows location, caretaker, dispatch, and email steps
- [ ] Step timestamps appear as each step completes
- [ ] Location card shows address, coordinates, and map link
- [ ] Contact cards show Notified badges after simulation
- [ ] Replay button resets flow for judges
- [ ] Simulation-only warnings visible on page

## Privacy & safety

- **911 dispatch** is always simulation only.
- **SMS** sends via Twilio when configured (primary caretaker only).
- **Email** sends via SMTP when configured.
- Location uses demo coordinates unless browser GPS is added later.
- For real emergencies, call your local emergency number immediately.

## Enable real SMS (Twilio)

Add to `.env.local`:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+15551234567
# Trial accounts: route SOS texts to your verified number
EMERGENCY_SMS_TO=+15559876543
```

Restart `npm run dev`, log in, and check **SOS service status** on `/emergency` — SMS should show **Ready**.

## Enable real email (SMTP)

```env
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your_user
SMTP_PASS=your_pass
SMTP_FROM="MediNova AI <noreply@medinova.ai>"
```

## Check connection status

- **UI:** `/emergency` → **SOS service status** panel (API / Email / SMS / Dispatch)
- **API:** `GET /api/emergency-alert/status` (proxied through Next.js when dev server runs)

## Next phase

**Phase 9** — Reports, accessibility, responsiveness, and demo reliability polish ✅ — see [POLISH-QA.md](./POLISH-QA.md).

**Phase 10** — README, demo script, future roadmap, screenshots, and final presentation polish ✅ — [DEMO-SCRIPT.md](./DEMO-SCRIPT.md), [DEPLOYMENT.md](./DEPLOYMENT.md).

See [BARCODE-SCANNER.md](./BARCODE-SCANNER.md) for Phase 7 and [SETUP.md](./SETUP.md) for troubleshooting.
