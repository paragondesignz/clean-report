# cPanel Deployment Guide for Clean Report

This guide will help you deploy your Next.js application to cPanel hosting.

## Prerequisites

1. **cPanel Access**: You need access to your cPanel hosting account
2. **Node.js Support**: Your hosting provider must support Node.js applications
3. **Domain/Subdomain**: A domain or subdomain to host your application

## Step 1: Prepare Your Application

### 1.1 Build the Application Locally

```bash
# Navigate to your project directory
cd clean-report

# Install dependencies
npm install

# Build the application
npm run build
```

### 1.2 Create Production Environment Variables

Create a `.env.local` file in your project root with your production values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Email Service (if using)
EMAIL_SERVICE_API_KEY=your_production_email_api_key

# Google Calendar (if using)
GOOGLE_CALENDAR_CLIENT_ID=your_production_google_client_id
GOOGLE_CALENDAR_CLIENT_SECRET=your_production_google_client_secret
```

## Step 2: cPanel Setup

### 2.1 Access cPanel

1. Log into your cPanel hosting account
2. Navigate to the "Node.js" section (if available)

### 2.2 Create Node.js App (if supported)

If your hosting provider supports Node.js applications:

1. Go to "Node.js" in cPanel
2. Click "Create Application"
3. Choose your domain/subdomain
4. Set the Node.js version to 18 or higher
5. Set the application root to your desired directory (e.g., `/clean-report`)
6. Set the application URL
7. Set the startup file to `server.js`

### 2.3 Alternative: Manual Setup

If Node.js apps aren't directly supported, you'll need to:

1. Create a new directory in your public_html folder
2. Upload your built application files
3. Configure a custom server

## Step 3: Upload Files

### 3.1 Using File Manager

1. In cPanel, go to "File Manager"
2. Navigate to your domain's root directory
3. Create a new folder (e.g., `clean-report`)
4. Upload the following files and folders:
   - `.next/` (built application)
   - `public/` (static assets)
   - `package.json`
   - `package-lock.json`
   - `next.config.ts`
   - `.env.local` (production environment variables)
   - `server.js` (custom server file)

### 3.2 Using FTP/SFTP

You can also use an FTP client to upload files:

1. Connect to your server via FTP
2. Navigate to your domain directory
3. Create a new folder for your application
4. Upload all necessary files

## Step 4: Create Custom Server

Create a `server.js` file in your project root:

```javascript
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
```

## Step 5: Configure Environment

### 5.1 Set Environment Variables

In cPanel Node.js section or via SSH:

```bash
# Set production environment
export NODE_ENV=production
export PORT=3000
```

### 5.2 Install Dependencies

Via SSH or cPanel terminal:

```bash
cd /path/to/your/application
npm install --production
```

## Step 6: Start the Application

### 6.1 Via cPanel Node.js Manager

1. Go to Node.js section in cPanel
2. Find your application
3. Click "Start" or "Restart"

### 6.2 Via SSH

```bash
cd /path/to/your/application
node server.js
```

### 6.3 Using PM2 (Recommended for Production)

```bash
# Install PM2 globally
npm install -g pm2

# Start your application
pm2 start server.js --name "clean-report"

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

## Step 7: Configure Domain/Subdomain

### 7.1 Create Subdomain (Recommended)

1. In cPanel, go to "Subdomains"
2. Create a new subdomain (e.g., `app.yourdomain.com`)
3. Point it to your application directory

### 7.2 Configure .htaccess (if needed)

If you need URL rewriting, create an `.htaccess` file:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

## Step 8: SSL Certificate

1. In cPanel, go to "SSL/TLS"
2. Install an SSL certificate for your domain/subdomain
3. Force HTTPS redirect if needed

## Troubleshooting

### Common Issues

1. **Port Issues**: Make sure your hosting provider allows the port you're using
2. **Environment Variables**: Ensure all production environment variables are set
3. **File Permissions**: Set proper permissions (755 for directories, 644 for files)
4. **Memory Limits**: Some shared hosting plans have memory limitations

### Debugging

1. Check error logs in cPanel
2. Use `console.log` statements in your server.js
3. Verify all dependencies are installed
4. Ensure Node.js version compatibility

## Maintenance

### Updates

1. Upload new built files
2. Restart the application
3. Clear any caches if necessary

### Monitoring

1. Monitor application logs
2. Check server resources
3. Set up uptime monitoring

## Support

If you encounter issues:

1. Check your hosting provider's Node.js documentation
2. Contact your hosting provider's support
3. Review the Next.js deployment documentation
4. Check the application logs for specific error messages 