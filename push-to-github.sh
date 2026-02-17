#!/bin/bash
# FaceSort — GitHub Push Script
# Usage: chmod +x push-to-github.sh && ./push-to-github.sh

set -e  # Exit on any error

echo "🚀 FaceSort GitHub Push"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ git is not installed. Install it first:"
    echo "   macOS: brew install git"
    echo "   Ubuntu: sudo apt-get install git"
    exit 1
fi

# Get GitHub username and repo name
echo "📝 Enter your GitHub username:"
read -r GITHUB_USERNAME

echo "📝 Enter repository name (default: facesort):"
read -r REPO_NAME
REPO_NAME=${REPO_NAME:-facesort}

REPO_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

echo ""
echo "Will push to: $REPO_URL"
echo ""
echo "⚠️  Make sure you created this repo on GitHub first!"
echo "   Go to: https://github.com/new"
echo "   Repo name: $REPO_NAME"
echo "   Leave all checkboxes UNCHECKED"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."

# Initialize git if not already
if [ ! -d .git ]; then
    echo "🔧 Initializing git repository..."
    git init
else
    echo "✓ Git already initialized"
fi

# Add all files
echo "📦 Staging all files..."
git add .

# Check if there are changes to commit
if git diff-index --quiet HEAD -- 2>/dev/null; then
    echo "ℹ️  No changes to commit"
else
    echo "💾 Creating commit..."
    git commit -m "feat: initial FaceSort app with OAuth + Neon DB + deployment config"
fi

# Rename to main branch
echo "🌿 Setting branch to main..."
git branch -M main

# Add remote (remove if exists)
if git remote | grep -q "^origin$"; then
    echo "🔗 Updating remote origin..."
    git remote set-url origin "$REPO_URL"
else
    echo "🔗 Adding remote origin..."
    git remote add origin "$REPO_URL"
fi

# Push
echo "🚀 Pushing to GitHub..."
echo ""
git push -u origin main

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Successfully pushed to GitHub!"
echo ""
echo "Next steps:"
echo "  1. View your repo: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo "  2. Add GitHub Secrets (Settings → Secrets → Actions):"
echo "     • DATABASE_URL"
echo "     • GOOGLE_CLIENT_ID"
echo "     • GOOGLE_CLIENT_SECRET"
echo "  3. Deploy to Vercel: https://vercel.com/new"
echo ""
echo "📖 Full deployment guide: see DEPLOYMENT.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
