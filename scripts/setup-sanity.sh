#!/bin/bash
# Sanity CMS First-Time Setup Script
# This script guides you through setting up Sanity CMS integration

set -e

echo "🚀 Sanity CMS Setup for EverydayAI Portfolio"
echo "=============================================="
echo ""

# Check if .env.local already exists
if [ -f .env.local ]; then
  echo "⚠️  .env.local already exists. Skipping creation."
else
  echo "📋 Creating .env.local from template..."
  cp .env.sanity.example .env.local
  echo "✅ Created .env.local - please fill in your Sanity credentials"
  echo ""
fi

# Check if Sanity project ID is set
if grep -q "YOUR_PROJECT_ID" .env.local; then
  echo "⚠️  SANITY_PROJECT_ID not yet configured in .env.local"
  echo ""
  echo "Follow these steps:"
  echo "1. Go to https://manage.sanity.io"
  echo "2. Create a new project (or select existing)"
  echo "3. Copy your Project ID"
  echo "4. Edit .env.local and replace YOUR_PROJECT_ID with your actual ID"
  echo "5. Generate API tokens in Sanity dashboard Settings → API"
  echo "6. Add SANITY_READ_TOKEN and SANITY_API_TOKEN to .env.local"
  echo ""
  echo "Once configured, run:"
  echo "  npm run sanity:dev"
  exit 0
fi

echo "✅ .env.local is configured"
echo ""
echo "📦 Installing Sanity dependencies..."
cd sanity
npm install
cd ..
echo "✅ Dependencies installed"
echo ""

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start Sanity Studio:     npm run sanity:dev"
echo "2. Open browser to:         http://localhost:3333"
echo "3. Create content (Articles, Design Styles, etc.)"
echo "4. Deploy studio (optional): npm run sanity:deploy"
echo "5. Build site:              npm run build"
echo ""
echo "For detailed docs, see: SANITY_INTEGRATION.md"
