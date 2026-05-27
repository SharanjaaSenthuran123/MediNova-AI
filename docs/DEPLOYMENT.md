# MediNova-AI — Production Deployment

MediNova-AI is a **split-stack** application:

| Service | Host | Technology |
|---------|------|------------|
| **Frontend** | Vercel | Next.js 15 |
| **API + WebSockets** | Render / Railway | Express + Socket.IO |
| **Database** | MongoDB Atlas | Mongoose |

Local development runs both with `npm run dev`.

---

## Architecture

```
Browser → Vercel (Next.js)
            ↓ rewrites /api/* (except app/api/auth, AI routes)
         Render/Railway (Express :4000)
            ↓
         MongoDB Atlas
```

**Auth:** JWT + MongoDB users (not Firebase). Cookies: `medinova_token`, `medinova_uid`.

---

## 1. MongoDB Atlas

1. Create a free M0 cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Add database user + network access (`0.0.0.0/0` for dev)
3. Connection string: `mongodb+srv://USER:PASS@CLUSTER.mongodb.net/medinova`

See [MONGODB-ATLAS.md](./MONGODB-ATLAS.md) for full steps.

Seed after first deploy:

```bash
npm run seed
```

---

## 2. Backend (Render / Railway)

**Root directory:** `server/`  
**Build command:** `npm install && npm run build`  
**Start command:** `npm start`  
**Health check:** `GET /health`

### Required environment variables

| Variable | Example |
|----------|---------|
| `MONGODB_URI` | `mongodb+srv://...` |
| `JWT_SECRET` | long random string (required in production) |
| `CLIENT_URL` | `https://your-app.vercel.app` |
| `PORT` | `4000` (Render sets automatically) |
| `OPENAI_API_KEY` | optional — live AI features |
| `STRIPE_SECRET_KEY` | optional — payments |
| `TWILIO_*` | optional — emergency SMS |

Use [render.yaml](../render.yaml) for one-click Render deploy, or [server/railway.toml](../server/railway.toml) for Railway.

### Railway

1. Go to [railway.app/new](https://railway.app/new) → **Deploy from GitHub repo** → select `MediNova-AI`
2. **Settings → Source → Root Directory** → `server`
3. **Settings → Config file path** → `/server/railway.toml` (optional — auto-detected if root is `server/`)
4. **Variables** tab — add:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | your Atlas URI |
| `JWT_SECRET` | long random string |
| `CLIENT_URL` | `http://localhost:3000` (or Vercel URL) |

5. **Settings → Networking → Generate Domain**
6. Verify: `GET https://YOUR-DOMAIN.up.railway.app/health`

CLI alternative (from `server/`):

```bash
railway login
railway init
railway variables set MONGODB_URI="..." JWT_SECRET="..." CLIENT_URL="http://localhost:3000"
railway up
railway domain
```

---

## 3. Frontend (Vercel)

**Root directory:** repository root  
**Build command:** `npm run build`  
**Framework:** Next.js

### Required environment variables

| Variable | Value |
|----------|-------|
| `API_URL` | `https://your-api.onrender.com` |
| `NEXT_PUBLIC_SOCKET_URL` | same as `API_URL` |
| `JWT_SECRET` | same as backend |
| `CLIENT_URL` | `https://your-app.vercel.app` |
| `MONGODB_URI` | only if running seed scripts from CI |

### Optional (Next.js AI routes)

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | Symptom checker, OCR, assistant |
| `GEMINI_API_KEY` | AI fallback |

---

## 4. Pre-deploy checklist

```bash
npm install
npm run seed          # local only — use Atlas URI
npm run dev           # test locally
npm run build         # production build
```

Verify:

- [ ] Login works (`patient@medinova.ai` / `demo123` after seed)
- [ ] `/pharmacy` — cart, checkout, order tracking
- [ ] `/reports` — loads from MongoDB history
- [ ] `/dashboard` — patient summary from `/api/dashboard`
- [ ] Barcode scanner — MongoDB medicine lookup
- [ ] Socket notifications on order updates

---

## 5. Security (production)

- Set strong `JWT_SECRET` on **both** Vercel and API host
- Restrict MongoDB Atlas IP allowlist before go-live
- Never commit `.env.local`
- Socket.IO `join` validates JWT cookie (user can only join own room)
- Rate limiting: 200 req/min on `/api`

---

## 6. What runs where

| Feature | Data source |
|---------|-------------|
| Auth, users, patients, doctors | MongoDB via Express |
| Nutrition, pharmacy, blood bank, payments | MongoDB via Express |
| Reports | MongoDB (symptoms, scans, orders, appointments) |
| Medicine barcode lookup | MongoDB + optional OpenAI enrich |
| Symptom checker / assistant | Next.js AI routes + history saved to MongoDB |
| Dashboard vitals charts | Wearables API / analytics (device integration optional) |
| Homepage marketing sections | Static `data/` (intentional — not user health data) |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Login fails | API not running — check `API_URL` on Vercel |
| Empty pharmacy | Run `npm run seed` against Atlas |
| Reports empty | Use app features first (symptom check, scans) to generate history |
| WebSockets silent | Set `NEXT_PUBLIC_SOCKET_URL` to API host |
