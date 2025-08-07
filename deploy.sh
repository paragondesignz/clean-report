#!/bin/bash

# Clean Report Deployment Script
# This script prepares your Next.js application for cPanel deployment

echo "🚀 Starting Clean Report deployment preparation..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf node_modules

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ ! -d ".next" ]; then
    echo "❌ Error: Build failed. .next directory not found."
    exit 1
fi

# Create deployment package
echo "📦 Creating deployment package..."
mkdir -p deployment
cp -r .next deployment/
cp -r public deployment/
cp package.json deployment/
cp package-lock.json deployment/
cp next.config.ts deployment/
cp server.js deployment/

# Create .env.local template if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local template..."
    cp env.example .env.local
    echo "⚠️  Please update .env.local with your production values before deploying"
fi

# Copy .env.local to deployment if it exists
if [ -f ".env.local" ]; then
    cp .env.local deployment/
fi

# Create .htaccess for cPanel
echo "📄 Creating .htaccess file..."
cat > deployment/.htaccess << 'EOF'
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# Cache static assets
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
    Header set Cache-Control "public, immutable"
</FilesMatch>
EOF

# Create deployment instructions
echo "📋 Creating deployment instructions..."
cat > deployment/DEPLOYMENT_INSTRUCTIONS.txt << 'EOF'
CLEAN REPORT DEPLOYMENT INSTRUCTIONS
====================================

1. UPLOAD FILES TO CPANEL:
   - Upload all files in this directory to your cPanel hosting
   - Create a new folder (e.g., 'clean-report') in your domain directory
   - Upload all files to that folder

2. SETUP NODE.JS APP (if supported):
   - Go to cPanel > Node.js
   - Create new application
   - Set startup file to: server.js
   - Set Node.js version to 18 or higher

3. INSTALL DEPENDENCIES:
   - Via SSH: cd /path/to/your/app && npm install --production
   - Or via cPanel terminal

4. SET ENVIRONMENT VARIABLES:
   - Update .env.local with your production values
   - Set NODE_ENV=production
   - Set PORT=3000 (or your preferred port)

5. START THE APPLICATION:
   - Via cPanel Node.js manager: Click "Start"
   - Via SSH: node server.js
   - Via PM2: pm2 start server.js --name "clean-report"

6. CONFIGURE DOMAIN:
   - Create subdomain (e.g., app.yourdomain.com)
   - Point to your application directory
   - Install SSL certificate

7. TEST:
   - Visit your domain to ensure the app is running
   - Check error logs if issues occur

For detailed instructions, see DEPLOYMENT.md in the main project directory.
EOF

echo "✅ Deployment package created successfully!"
echo "📁 Files ready for upload are in the 'deployment' directory"
echo "📋 See deployment/DEPLOYMENT_INSTRUCTIONS.txt for next steps"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your production values"
echo "2. Upload the contents of 'deployment' folder to your cPanel hosting"
echo "3. Follow the instructions in DEPLOYMENT_INSTRUCTIONS.txt" 