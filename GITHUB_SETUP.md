# Push to GitHub — Quick Start

## Step 1: Create a GitHub repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `facesort` (or whatever you want)
3. **Leave "Initialize this repository" options UNCHECKED** (no README, no .gitignore, no license)
4. Click **Create repository**
5. Copy your repository URL (looks like `https://github.com/YOUR_USERNAME/facesort.git`)

## Step 2: Initialize git locally

Open your terminal in the `facesort` project folder and run:

```bash
# Initialize git
git init

# Add all files
git add .

# Make your first commit
git commit -m "feat: initial FaceSort app with OAuth + Neon DB"

# Rename branch to main (if needed)
git branch -M main

# Connect to your GitHub repo (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/facesort.git

# Push to GitHub
git push -u origin main
```

**That's it!** Your code is now on GitHub.

---

## If you get authentication errors

GitHub no longer accepts passwords for git operations. You need to use either:

### Option A: Personal Access Token (easier)

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token → Generate new token (classic)**
3. Name: `facesort-push`
4. Select scope: **repo** (full control of private repositories)
5. Click **Generate token** and **copy the token immediately** (you won't see it again)
6. When git asks for a password, paste the token instead

### Option B: SSH Keys (better for frequent use)

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Press Enter to accept default file location
# Add a passphrase or press Enter to skip

# Copy your public key
cat ~/.ssh/id_ed25519.pub

# Go to github.com/settings/keys → New SSH key
# Paste the public key and save

# Change your remote to use SSH
git remote set-url origin git@github.com:YOUR_USERNAME/facesort.git

# Push
git push -u origin main
```

---

## Verify it worked

1. Refresh your GitHub repo page
2. You should see all your files listed
3. The README and folder structure should be visible

---

## Next steps after pushing

Once your code is on GitHub:

1. **Add GitHub Secrets** (for CI workflow):
   - Go to repo **Settings → Secrets and variables → Actions**
   - Click **New repository secret**
   - Add these 3 secrets:
     - `DATABASE_URL` (your Neon connection string)
     - `GOOGLE_CLIENT_ID`
     - `GOOGLE_CLIENT_SECRET`

2. **Connect to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click **Import** next to your `facesort` repo
   - Follow the deployment guide

---

## Common issues

**Error: "remote origin already exists"**
```bash
# Remove the old remote and add new one
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/facesort.git
git push -u origin main
```

**Error: "failed to push some refs"**
```bash
# Force push (only safe if you just created the repo)
git push -u origin main --force
```

**Error: "Support for password authentication was removed"**
→ Use Personal Access Token (Option A above) instead of your GitHub password

---

## Full workflow reference

```bash
# ── One-time setup ──────────────────────────────────────────
git init
git add .
git commit -m "feat: initial commit"
git branch -M main
git remote add origin https://github.com/YOU/facesort.git
git push -u origin main

# ── Daily workflow ──────────────────────────────────────────
git add .
git commit -m "feat: add scan progress page"
git push

# ── Branch workflow ─────────────────────────────────────────
git checkout -b feature/face-detection
# ... make changes ...
git add .
git commit -m "feat: implement face detection API"
git push -u origin feature/face-detection
# Then create PR on GitHub: main ← feature/face-detection
```
