# MediNova-AI — Phase 12 Advanced AI & Integrations

Phase 12 adds **differentiating demo features** beyond the hackathon MVP: conversational AI follow-ups, medicine reminders, appointment booking, and wearable sync — all built on the Phase 11 profile store.

---

## What Phase 12 adds

| Feature | Route / API | Notes |
|---------|-------------|-------|
| AI Health Assistant | `/assistant`, `POST /api/assistant` | Chat with symptom-check context |
| Medicine reminders | `/reminders`, `/api/reminders` | Auto-suggest from OCR/scan history |
| Doctor appointments | `/appointments`, `/api/appointments` | Booking UI + prep checklists |
| Wearable sync | Dashboard card, `/api/wearables` | Simulated Apple Health / Fitbit / Garmin |

---

## AI Health Assistant

1. Run a **symptom check** — context is saved to `sessionStorage`.
2. Open **`/assistant`** or tap **Ask follow-up questions** on the result card.
3. Chat uses OpenAI when configured; otherwise smart demo replies.

```http
POST /api/assistant
{
  "messages": [{ "role": "user", "content": "When should I see a doctor?" }],
  "context": {
    "symptoms": "fever, headache",
    "possibleConditions": ["Flu", "Common cold"],
    "urgency": "moderate"
  }
}
```

---

## Smart Medicine Reminders

- **Manual** — add medicine name, schedule, and channel (push/email/both).
- **Suggested** — medicines from prescription OCR and barcode history appear automatically.
- **Simulate alert** — demo button records a fake notification timestamp.

```http
GET  /api/reminders              → { reminders, suggestions }
POST /api/reminders              → Create reminder
PATCH /api/reminders             → Toggle enabled / simulate notify
DELETE /api/reminders?id=...     → Remove reminder
```

---

## Doctor Appointments

- Book **virtual** or **in-person** visits with provider, specialty, date, and time.
- Each booking includes a **prep checklist** (symptoms list, meds, questions).
- Mark appointments **completed** or **cancelled** for demo flow.

```http
GET  /api/appointments           → { appointments }
POST /api/appointments           → Book new visit
PATCH /api/appointments          → Update status or notes
```

---

## Wearable Sync

Connect from the **dashboard** wearable card:

```http
GET  /api/wearables              → { sync: WearableSyncState }
POST /api/wearables              → { provider: "apple_health" | "fitbit" | "garmin" }
DELETE /api/wearables            → Disconnect
```

Imported metrics (heart rate, sleep, steps, active minutes) are **simulated** per provider.

---

## Demo flow

1. Create a profile at `/profile`
2. Run symptom check → open `/assistant` for follow-ups
3. Scan prescription or barcode → open `/reminders` for suggestions
4. Book at `/appointments`
5. Connect wearable on `/dashboard`

---

## Phase 12 checklist

- [ ] Symptom check passes context to AI Assistant
- [ ] Assistant chat works in demo and live OpenAI modes
- [ ] Reminders suggest medicines from history
- [ ] Simulate push/email reminder works
- [ ] Appointment booking shows prep checklist
- [ ] Wearable connect imports demo vitals
- [ ] `npm run build` passes

---

## Related docs

- [BACKEND.md](./BACKEND.md) — Phase 11 profiles & history
- [FUTURE-ROADMAP.md](./FUTURE-ROADMAP.md) — Phase 13 vision
