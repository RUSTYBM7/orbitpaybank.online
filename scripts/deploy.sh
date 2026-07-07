#!/usr/bin/env bash
# Deploy-from-your-machine script.
# This runs ON YOUR laptop (not in the AI session) and uses your Vercel
# token — kept on your machine, never sent to a chat.
#
# One-time setup (5 minutes):
#   1. Install Vercel CLI:        npm i -g vercel
#   2. Login to Vercel:           vercel login
#   3. Link this folder:          vercel link --yes
#      (creates .vercel/ with project.json + org_id + project_id)
#   4. Add the custom domain in Vercel dashboard → orbitpaybank.online
#      points to this project.
#   5. In Vercel dashboard → Settings → Environment Variables, set:
#        VITE_SUPABASE_URL
#        VITE_SUPABASE_ANON_KEY
#        VITE_SMARTSUPP_WIDGET_KEY        (optional, public value)
#   6. cd dist && vercel deploy --prod --yes
#
# That's it. The token used is your locally-logged-in Vercel session,
# scoped to this one project via the .vercel/ link state.
set -euo pipefail

if [ ! -d "dist" ]; then
  echo "dist/ not found. Run \`npm run build\` first."
  exit 1
fi

cd dist

echo ">> Verifying Vercel CLI..."
if ! command -v vercel >/dev/null 2>&1; then
  echo "vercel CLI not installed. Run: npm i -g vercel"
  exit 1
fi

if [ ! -f "../.vercel/project.json" ]; then
  echo "Project not linked yet. Running \`vercel link\` first..."
  cd ..
  vercel link --yes
  cd dist
fi

echo ">> Deploying to production..."
vercel deploy --prod --yes

echo ""
echo "Done. Visit https://orbitpaybank.online in 30–60 seconds."