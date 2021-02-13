#/bin/bash
# Feirm Platform web app deployment script

# Deployment folders
PRODUCTION="app.feirm.com"
STAGING="staging.feirm.com"

# Current branch
CURRENT_BRANCH=$(git branch --show-current)

# Production deployment
# Fetch latest tag
echo 'Getting ready for production deployment...'
LATEST_TAG=$(git describe --abbrev=0)

# Checkout and compile for production
git checkout $LATEST_TAG
rm -rf node_modules
yarn install
yarn build --mode production

# Copy files over to server
echo 'Transferring files to production server...'
scp -r dist/* feirm:/home/jack/Feirm-Caddy/caddy_data/$PRODUCTION
rm -rf dist/

# Checkout back to previous branch
git checkout $CURRENT_BRANCH 