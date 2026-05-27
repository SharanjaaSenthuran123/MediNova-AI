# MediNova-AI — Phase 11 Backend & User Accounts

Phase 11 adds **demo persistence** — user profiles, activity history, and emergency contact management — without requiring Supabase or a paid database.

---

## What Phase 11 adds

| Feature | Route / API | Notes |
|---------|-------------|-------|
| User profile | `/profile`, `GET/POST/PATCH /api/user` | Cookie session, no password |
| Activity history | `/history`, `GET /api/history` | Symptoms, OCR, barcodes |
| Auto-save symptoms | `POST /api/history/symptoms` | After each AI analysis |
| Auto-save OCR | `POST /api/history/prescriptions` | Text preview only — no images |
| Auto-save scans | `POST /api/history/barcodes` | Barcode + medicine name |
| Emergency contacts | `GET/PUT /api/user/contacts` | User-managed caretaker list |

---

## How it works

1. User visits **`/profile`** and creates a demo profile (name + email).
2. A **httpOnly cookie** (`medinova_uid`) stores the session.
3. Data persists in **`.data/store.json`** locally (gitignored).
4. Feature pages **auto-save** results when a profile exists.
5. **`/history`** shows a filterable timeline of past activity.

```
Browser → API routes → lib/db/store.ts → .data/store.json
                ↑
         Cookie session (medinova_uid)
```

---

## API reference

### User

```http
GET  /api/user          → { user: UserProfile | null }
POST /api/user          → Create profile + set cookie
PATCH /api/user         → Update profile (requires session)
DELETE /api/user        → Sign out (clear cookie)
```

### History

```http
GET  /api/history?type=all|symptoms|prescriptions|barcodes
POST /api/history/symptoms       → Save symptom check
POST /api/history/prescriptions  → Save OCR result
POST /api/history/barcodes       → Save barcode lookup
```

### Emergency contacts

```http
GET /api/user/contacts  → { contacts: StoredEmergencyContact[] }
PUT /api/user/contacts  → Replace contact list
```

---

## Demo flow

1. Run `npm run dev`
2. Go to **`/profile`** → create profile
3. Run a symptom check, OCR scan, or barcode lookup
4. Open **`/history`** → see saved entries
5. Add emergency contacts on the profile page

---

## Storage notes

| Environment | Behavior |
|-------------|----------|
| Local dev | Persists in `.data/store.json` across restarts |
| Serverless (Vercel) | In-memory fallback per instance — data may reset on cold start |

For production, migrate to **Supabase**, **Firebase**, or **PostgreSQL + NextAuth** as described in [FUTURE-ROADMAP.md](./FUTURE-ROADMAP.md).

---

## Security (demo scope)

- No passwords — suitable for hackathon demos only
- Cookie session identifies the user; not suitable for PHI
- OCR images are **never** stored server-side
- History capped at **50 entries** per type per user

---

## File map

```
types/user.ts              — Profile & history types
lib/db/store.ts            — JSON file persistence
lib/auth/session.ts        — Cookie helpers
lib/user-schema.ts         — Zod validation
lib/history-client.ts      — Client-side save helpers
app/api/user/              — Profile + contacts routes
app/api/history/           — History routes
features/profile/          — ProfileClient
features/history/          — HistoryClient
app/profile/               — Profile page
app/history/               — History page
```

---

## Phase 11 checklist

- [ ] Create profile at `/profile`
- [ ] Symptom check saves to history automatically
- [ ] OCR scan saves medicine names (not images)
- [ ] Barcode lookup saves to history
- [ ] Emergency contacts save from profile page
- [ ] `/history` filters by type (All / Symptoms / Prescriptions / Scans)
- [ ] `npm run build` passes

---

## Related docs

- [FUTURE-ROADMAP.md](./FUTURE-ROADMAP.md) — Phase 12+ vision
- [DEMO-SCRIPT.md](./DEMO-SCRIPT.md) — presentation flow
- [SETUP.md](./SETUP.md) — local development
