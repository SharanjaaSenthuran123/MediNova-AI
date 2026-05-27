# MongoDB Atlas Setup — MediNova-AI

Use this guide to connect MediNova-AI to a free MongoDB Atlas cluster for **real user accounts**, persistent patient records, appointments, AI health history, and barcode scan storage.

> **Note:** This project uses **Express + JWT auth**, not NextAuth. Use `JWT_SECRET` and `CLIENT_URL` in `.env.local` (not `NEXTAUTH_SECRET` / `NEXTAUTH_URL`).

---

## 1. Create MongoDB Atlas account

1. Open [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Sign up with Google or email.
3. Create a **Free Cluster (M0)**.
4. Choose a region near Sri Lanka/Asia (e.g. **Mumbai (ap-south-1)** or **Singapore (ap-southeast-1)**).

---

## 2. Create database user

1. In Atlas, go to **Database Access**.
2. Click **Add New Database User**.
3. Example:
   - **Username:** `medinovaadmin`
   - **Password:** a strong password (save it safely)
4. Role: **Read and write to any database** (or Atlas default for dev).

---

## 3. Allow network access

1. Go to **Network Access**.
2. Click **Add IP Address**.
3. For local development, add **`0.0.0.0/0`** (allows all IPs temporarily).
4. Restrict this to your own IP before production.

---

## 4. Get connection string

1. Go to **Clusters** → **Connect** → **Drivers**.
2. Copy the connection string. It looks like:

   ```text
   mongodb+srv://medinovaadmin:<password>@cluster0.xxxxx.mongodb.net/
   ```

3. Replace `<password>` with your database user password.
4. Add the database name `medinova` at the end:

   ```text
   mongodb+srv://medinovaadmin:StrongPassword123@cluster0.abcd.mongodb.net/medinova
   ```

   If your password contains special characters (`@`, `#`, `:`, etc.), [URL-encode](https://www.urlencoder.org/) them in the connection string.

---

## 5. Update `.env.local`

In the project root (`MediNova-AI/`), edit `.env.local`:

```env
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/medinova
JWT_SECRET=your-long-random-secret-here
CLIENT_URL=http://localhost:3000
API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

Keep your existing `OPENAI_API_KEY` line unchanged.

---

## 6. Install packages

From the project root:

```bash
npm install
```

MongoDB packages are already included:

| Package   | Location        | Purpose                          |
|-----------|-----------------|----------------------------------|
| `mongoose`| `server/`       | Express API database (primary)   |
| `mongoose`| project root    | `lib/mongodb.ts` helper (optional) |
| `bcryptjs`| `server/`       | Password hashing for auth        |

You do **not** need `next-auth` — auth is handled by the Express API at `/api/auth/*`.

---

## 7. Seed demo data (recommended)

After Atlas is connected:

```bash
npm run seed
```

This creates demo users, doctors, medicines, and sample records.

---

## 8. Run the project

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Verify MongoDB connected:** the API terminal should show:

```text
MongoDB connected: mongodb+srv://medinovaadmin:***@cluster0.xxxxx.mongodb.net/medinova
```

It should **not** show `DEMO MODE`.

You can also check [http://localhost:3000/api/health](http://localhost:3000/api/health).

---

## 9. Register and sign in

1. Open [http://localhost:3000/register](http://localhost:3000/register).
2. Create an account with your email and password (min 6 characters).
3. Sign in at the homepage.

Custom email registration **requires MongoDB** — it will not persist in demo mode.

Demo accounts (always available when seeded):

| Email                 | Password  | Role    |
|-----------------------|-----------|---------|
| `patient@medinova.ai` | `demo123` | Patient |
| `doctor@medinova.ai`  | `demo123` | Doctor  |
| `admin@medinova.ai`   | `demo123` | Admin   |

---

## What you get with Atlas

- Real user accounts (email + password)
- Users stored in MongoDB
- Patient records and profiles
- Appointment data
- AI health history
- Barcode scan result storage

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| API shows `DEMO MODE` | Check `MONGODB_URI` in `.env.local`, Atlas IP whitelist, and restart `npm run dev` |
| Authentication failed | Verify username/password; URL-encode special chars in password |
| `npm run seed` fails | Ensure Atlas cluster is running and network access allows your IP |
| Registration says email exists | User already in DB — sign in or use a different email |

See also [SETUP.md](./SETUP.md) for general local development help.
