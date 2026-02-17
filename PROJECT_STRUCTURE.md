# FaceSort — Project Structure

```
facesort/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing / folder selector  ← built ✅
│   ├── scan/
│   │   └── page.tsx        # Scanning progress page     (next)
│   └── results/
│       └── page.tsx        # Results & portrait grid    (next)
├── components/
│   ├── AlbumInput.tsx      # URL input card
│   ├── ScanProgress.tsx    # Live scan progress
│   └── FaceGrid.tsx        # Detected faces grid
├── lib/
│   ├── db.ts               # Neon DB client
│   ├── google-photos.ts    # Google Photos API helpers
│   └── face-detection.ts   # Face detection logic
├── api/
│   └── (routes handled via app/api/)
├── .env.local              # Secrets (not committed)
└── README.md
```

## Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Database**: Neon (Postgres) via `@neondatabase/serverless`
- **CI/CD**: GitHub → Vercel (auto-deploy on push)
- **Face Detection**: Google Cloud Vision API (or face-api.js)
- **Google Photos**: Google Photos Library API (OAuth2)

## Setup

```bash
npx create-next-app@latest facesort --typescript --app
cd facesort
npm install @neondatabase/serverless googleapis
```

## Environment Variables (.env.local)

```
DATABASE_URL=postgresql://...  # From Neon dashboard
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
