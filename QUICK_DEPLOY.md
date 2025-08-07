# Quick Deploy Guide - Clean Report

## 🚀 Fast Deployment Steps

### 1. Prepare Your Application

```bash
# Run the deployment script
./deploy.sh
```

This will:
- Build your application
- Create a deployment package
- Generate necessary configuration files

### 2. Update Environment Variables

Edit `deployment/.env.local` with your production values:

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_supabase_service_role_key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 3. Upload to cPanel

1. **Access cPanel**: Log into your hosting account
2. **File Manager**: Go to File Manager
3. **Create Directory**: Create a new folder (e.g., `clean-report`)
4. **Upload Files**: Upload all contents of the `deployment` folder

### 4. Setup Node.js App

**Option A: If your hosting supports Node.js apps**
1. Go to cPanel > Node.js
2. Create Application
3. Set startup file: `server.js`
4. Set Node.js version: 18 or higher

**Option B: Manual setup**
1. Via SSH: `cd /path/to/your/app`
2. Install dependencies: `npm install --production`
3. Start app: `node server.js`

### 5. Configure Domain

1. **Create Subdomain**: Go to cPanel > Subdomains
2. **Point to App**: Point subdomain to your app directory
3. **SSL Certificate**: Install SSL in cPanel > SSL/TLS

### 6. Test Your App

Visit your domain to ensure everything is working!

## 🔧 Troubleshooting

- **Port Issues**: Check if port 3000 is available
- **Environment Variables**: Ensure all required variables are set
- **File Permissions**: Set directories to 755, files to 644
- **Logs**: Check error logs in cPanel

## 📞 Need Help?

1. Check the detailed `DEPLOYMENT.md` guide
2. Review your hosting provider's Node.js documentation
3. Contact your hosting provider's support

---

**Note**: Make sure your hosting provider supports Node.js applications before proceeding. 