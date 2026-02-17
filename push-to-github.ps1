# FaceSort — GitHub Push Script (Windows)
# Usage: Right-click → Run with PowerShell
#    OR: .\push-to-github.ps1

Write-Host "🚀 FaceSort GitHub Push" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Check if git is installed
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ git is not installed." -ForegroundColor Red
    Write-Host "   Download from: https://git-scm.com/download/win"
    exit 1
}

# Get GitHub username and repo name
$GITHUB_USERNAME = Read-Host "📝 Enter your GitHub username"
$REPO_NAME = Read-Host "📝 Enter repository name (default: facesort)"
if ([string]::IsNullOrWhiteSpace($REPO_NAME)) {
    $REPO_NAME = "facesort"
}

$REPO_URL = "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

Write-Host ""
Write-Host "Will push to: $REPO_URL" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  Make sure you created this repo on GitHub first!" -ForegroundColor Yellow
Write-Host "   Go to: https://github.com/new"
Write-Host "   Repo name: $REPO_NAME"
Write-Host "   Leave all checkboxes UNCHECKED"
Write-Host ""
Read-Host "Press Enter to continue or Ctrl+C to cancel"

# Initialize git if not already
if (-not (Test-Path .git)) {
    Write-Host "🔧 Initializing git repository..." -ForegroundColor Cyan
    git init
} else {
    Write-Host "✓ Git already initialized" -ForegroundColor Green
}

# Add all files
Write-Host "📦 Staging all files..." -ForegroundColor Cyan
git add .

# Create commit
Write-Host "💾 Creating commit..." -ForegroundColor Cyan
git commit -m "feat: initial FaceSort app with OAuth + Neon DB + deployment config"

# Rename to main branch
Write-Host "🌿 Setting branch to main..." -ForegroundColor Cyan
git branch -M main

# Check if remote exists
$remoteExists = git remote | Select-String -Pattern "^origin$"
if ($remoteExists) {
    Write-Host "🔗 Updating remote origin..." -ForegroundColor Cyan
    git remote set-url origin $REPO_URL
} else {
    Write-Host "🔗 Adding remote origin..." -ForegroundColor Cyan
    git remote add origin $REPO_URL
}

# Push
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Cyan
Write-Host ""
git push -u origin main

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. View your repo: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
Write-Host "  2. Add GitHub Secrets (Settings → Secrets → Actions):"
Write-Host "     • DATABASE_URL"
Write-Host "     • GOOGLE_CLIENT_ID"
Write-Host "     • GOOGLE_CLIENT_SECRET"
Write-Host "  3. Deploy to Vercel: https://vercel.com/new"
Write-Host ""
Write-Host "📖 Full deployment guide: see DEPLOYMENT.md"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
