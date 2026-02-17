# FaceSort — Deployment Guide

> **Stack:** Next.js 14 · Neon (Postgres) · Google Cloud · GitHub · Vercel  
> **Time to deploy:** ~25 minutes on first run

---

## Overview

```
Your Machine  →  GitHub (push)  →  Vercel (auto-deploy)
                                        ↕
                                   Neon DB (Postgres)
                                        ↕
                                Google Photos API
```

Every push to `main` triggers a Vercel production deploy.  
Every push to any other branch triggers a Vercel preview deploy with its own URL.

---

## Step 1 — Google Cloud Console Setup

### 1.1 Create a project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown (top left) → **New Project**
3. Name it `facesort` → **Create**

### 1.2 Enable required APIs

In the left sidebar: **APIs & Services → Library**

Search for and enable these two:

| API | Why |
|-----|-----|
| **Google Photos Library API** | Read albums + media items |
| **Google+ API** / **People API** | Fetch user profile (name, email, avatar) |

> ⚠️ The Photos Library API requires a **verification review** for production  
> apps with >100 users. For personal/beta use, unverified mode is fine.

### 1.3 Create OAuth 2.0 credentials

1. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
2. Application type: **Web application**
3. Name: `FaceSort Web`
4. Add **Authorized redirect URIs** — you need both:

```
http://localhost:3000/api/auth/callback
https://YOUR-APP.vercel.app/api/auth/callback
```

> You can add the Vercel URL after Step 4 once you know it.

5. Click **Create** → copy the **Client ID** and **Client Secret** — you'll need these in Steps 3 and 4.

### 1.4 Configure OAuth consent screen

**APIs & Services → OAuth consent screen**

| Field | Value |
|-------|-------|
| App name | FaceSort |
| User support email | your email |
| Authorized domains | `vercel.app` (add your custom domain later) |
| Scopes | `openid`, `email`, `profile`, `photoslibrary.readonly` |

For testing: add your own Google account under **Test users** (required while app is unverified).

---

## Step 2 — Neon Database Setup

### 2.1 Create a Neon project

1. Go to [neon.tech](https://neon.tech) → **New Project**
2. Name: `facesort`
3. Region: choose closest to your Vercel region (default `us-east-1` / `iad1`)
4. Click **Create project**

### 2.2 Get your connection string

In the Neon dashboard: **Connection Details → Connection string**

It looks like:
```
postgresql://facesort_owner:PASS@ep-xxx-xxx.us-east-2.aws.neon.tech/facesort?sslmode=require
```

Copy this — it's your `DATABASE_URL`.

### 2.3 Run the initial migration

**Option A — Drizzle push (recommended for dev):**
```bash
# In your project root with .env.local set up:
npx drizzle-kit push
```

**Option B — Run SQL directly:**
```bash
psql "$DATABASE_URL" -f drizzle/0000_init.sql
```

**Option C — Neon SQL Editor:**  
Paste the contents of `drizzle/0000_init.sql` into the Neon dashboard SQL editor and run it.

### 2.4 Verify tables were created

In the Neon SQL editor, run:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected output:
```
 albums
 face_detections
 persons
 scans
 users
```

---

## Step 3 — Local Development Setup

### 3.1 Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/facesort.git
cd facesort
npm install
```

### 3.2 Create .env.local

```bash
cp .env.example .env.local
```

Fill in your values:

```bash
# .env.local

DATABASE_URL=postgresql://...@ep-xxx.aws.neon.tech/facesort?sslmode=require

GOOGLE_CLIENT_ID=123456789-xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3.3 Run locally

```bash
npm run dev
# → http://localhost:3000
```

Visit `/auth` and sign in with Google. Check your Neon DB to confirm a row was inserted into the `users` table.

---

## Step 4 — GitHub Repository

### 4.1 Create repo

```bash
# In project root:
git init
git add .
git commit -m "feat: initial FaceSort app"

# On GitHub: create a new repo named 'facesort'
git remote add origin https://github.com/YOUR_USERNAME/facesort.git
git branch -M main
git push -u origin main
```

### 4.2 Add GitHub Secrets (for CI)

Go to your repo: **Settings → Secrets and variables → Actions → New repository secret**

| Secret name | Value |
|-------------|-------|
| `DATABASE_URL` | Your Neon connection string |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |

These are used by the CI workflow (`.github/workflows/ci.yml`) to run build checks on PRs.

---

## Step 5 — Vercel Deployment

### 5.1 Import project

1. Go to [vercel.com](https://vercel.com) → **Add New → Project**
2. Click **Import** next to your `facesort` GitHub repo
3. Framework preset: **Next.js** (auto-detected)
4. Leave Build & Output settings as default
5. **Don't deploy yet** — add env vars first

### 5.2 Add environment variables

In Vercel project settings: **Settings → Environment Variables**

Add each variable for **Production**, **Preview**, and **Development**:

| Variable | Value | Environments |
|----------|-------|--------------|
| `DATABASE_URL` | Neon connection string | All |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | All |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | All |
| `GOOGLE_REDIRECT_URI` | See table below | Per environment |
| `NEXT_PUBLIC_APP_URL` | See table below | Per environment |

**Environment-specific values:**

| Variable | Production | Preview | Development |
|----------|-----------|---------|-------------|
| `GOOGLE_REDIRECT_URI` | `https://your-app.vercel.app/api/auth/callback` | `https://*.vercel.app/api/auth/callback` | `http://localhost:3000/api/auth/callback` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | (auto) | `http://localhost:3000` |

> ⚠️ **Preview deployments** get unique URLs like `facesort-abc123.vercel.app`.  
> To make OAuth work on preview URLs, add a wildcard redirect URI in Google Cloud:  
> `https://*.vercel.app/api/auth/callback`

### 5.3 Deploy

Click **Deploy**. Vercel will:
1. Clone your repo
2. Run `npm ci`
3. Run `npm run build`
4. Deploy to `https://facesort-xxx.vercel.app`

### 5.4 Update Google OAuth redirect URI

Now that you know your Vercel URL, go back to Google Cloud:  
**APIs & Services → Credentials → Your OAuth Client → Edit**

Add:
```
https://facesort-xxx.vercel.app/api/auth/callback
```

---

## Step 6 — CI/CD Workflow

### How it works

```
dev branch  →  PR to main  →  GitHub Actions CI runs
                               ✓ tsc --noEmit
                               ✓ eslint
                               ✓ next build
               ↓ merge
             main branch  →  Vercel auto-deploys to production
```

### Branch strategy

| Branch | Purpose | Deploy |
|--------|---------|--------|
| `main` | Production | Vercel production URL |
| `dev` | Active development | Vercel preview URL |
| `feature/*` | Feature branches | Vercel preview URL (per PR) |

### Adding Vercel token to GitHub (optional — for CLI deploys)

```bash
# Get token from vercel.com → Settings → Tokens
# Add as GitHub Secret: VERCEL_TOKEN
```

---

## Step 7 — Custom Domain (Optional)

In Vercel: **Settings → Domains → Add Domain**

Enter your domain (e.g. `facesort.app`) and follow the DNS instructions.

Then update:
1. `NEXT_PUBLIC_APP_URL` → `https://facesort.app`
2. `GOOGLE_REDIRECT_URI` → `https://facesort.app/api/auth/callback`
3. Google Cloud OAuth → Add `https://facesort.app/api/auth/callback` to redirect URIs
4. Google OAuth consent screen → Add `facesort.app` to authorized domains

---

## Environment Variables — Full Reference

```bash
# ── Required ──────────────────────────────────────────────────

# Neon Postgres connection string (with sslmode=require)
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require

# Google OAuth 2.0 credentials
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx

# Must match exactly what's registered in Google Cloud Console
GOOGLE_REDIRECT_URI=https://your-app.vercel.app/api/auth/callback

# ── Public (exposed to browser) ───────────────────────────────

# Your app's base URL — no trailing slash
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## Troubleshooting

### "redirect_uri_mismatch" from Google

The `GOOGLE_REDIRECT_URI` env var doesn't exactly match what's registered in Google Cloud Console.  
Check for: trailing slashes, http vs https, exact domain.

### "Error: DATABASE_URL is not set"

The env var isn't reaching the runtime. In Vercel, confirm it's set for the **Production** environment and redeploy.

### OAuth works locally but not on Vercel

Ensure you added the Vercel URL as an authorized redirect URI in Google Cloud Console **and** redeployed after updating `GOOGLE_REDIRECT_URI`.

### "Test user" error from Google

Your Google account isn't listed as a test user. Go to Google Cloud → OAuth consent screen → Test users → Add yourself.

### Neon connection timeout

Neon free tier projects auto-suspend after 5 minutes of inactivity. The first request after suspension takes ~1-2 seconds to wake up. This is expected behavior — use the connection pooler URL from Neon for better cold-start performance.

---

## Checklist

- [ ] Google Cloud project created
- [ ] Photos Library API + People API enabled
- [ ] OAuth 2.0 credentials created with correct redirect URIs
- [ ] Test users added to OAuth consent screen
- [ ] Neon project created + migration run
- [ ] `.env.local` filled in and working locally
- [ ] GitHub repo created and pushed
- [ ] GitHub Secrets added (DATABASE_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
- [ ] Vercel project imported with all env vars set
- [ ] Production deploy successful
- [ ] Sign-in flow tested end-to-end on production URL
- [ ] Vercel production URL added to Google OAuth redirect URIs
