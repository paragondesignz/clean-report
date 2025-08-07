# Xero Integration - Complete Setup Guide

## Overview
The Xero integration allows Pro users to connect their Xero accounting software with Clean Report for seamless invoice management, contact synchronization, and financial data integration.

## Features
- **Invoice Management**: Create and sync invoices from jobs
- **Contact Synchronization**: Sync clients between Clean Report and Xero
- **Account Management**: Access Xero chart of accounts
- **Real-time Sync**: Webhook support for live updates
- **Pro-only Access**: Restricted to Pro tier users

## Prerequisites
- Pro subscription tier
- Xero account
- Node.js 18+
- Supabase project

## Step-by-Step Setup

### 1. Xero App Registration

#### Create Xero App
1. Visit [Xero Developer Portal](https://developer.xero.com/)
2. Sign in with your Xero account
3. Click "New App" to create a new application
4. Fill in the app details:
   - **App Name**: Clean Report Integration
   - **App Type**: Web app
   - **Redirect URI**: `https://yourdomain.com/api/xero/callback`
   - **Scopes**: Select the following permissions:
     - `offline_access`
     - `accounting.transactions`
     - `accounting.contacts`
     - `accounting.settings`
     - `accounting.reports.read`

#### Get API Credentials
1. After creating the app, note down:
   - **Client ID**
   - **Client Secret**
2. These will be used in your environment variables

### 2. Environment Configuration

```bash
# Add to .env.local
XERO_CLIENT_ID=your-xero-client-id
XERO_CLIENT_SECRET=your-xero-client-secret
XERO_REDIRECT_URI=https://yourdomain.com/api/xero/callback

# For development
NEXT_PUBLIC_XERO_CLIENT_ID=your-xero-client-id
NEXT_PUBLIC_XERO_REDIRECT_URI=http://localhost:3000/api/xero/callback
```

### 3. Install Dependencies

```bash
npm install xero-node @radix-ui/react-progress --legacy-peer-deps
```

### 4. Database Schema

Create the Xero connections table in Supabase:

```sql
-- Create xero_connections table
CREATE TABLE xero_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  tenant_id TEXT NOT NULL,
  tenant_name TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE xero_connections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own Xero connections" ON xero_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Xero connections" ON xero_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Xero connections" ON xero_connections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Xero connections" ON xero_connections
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_xero_connections_user_id ON xero_connections(user_id);
```

### 5. API Routes Setup

Create the Xero callback API route:

```typescript
// app/api/xero/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { XeroIntegration } from '@/lib/xero-integration'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    
    if (!code) {
      return NextResponse.redirect('/settings?error=no_code')
    }
    
    const connection = await XeroIntegration.handleCallback(code)
    
    // In a real app, save to database here
    // await saveXeroConnection(connection)
    
    return NextResponse.redirect('/settings?success=xero_connected')
  } catch (error) {
    console.error('Xero callback error:', error)
    return NextResponse.redirect('/settings?error=xero_connection_failed')
  }
}
```

### 6. Webhook Setup (Optional)

For real-time updates, set up Xero webhooks:

```typescript
// app/api/xero/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { XeroIntegration } from '@/lib/xero-integration'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    await XeroIntegration.handleWebhook(payload)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
```

### 7. Test the Integration

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to Settings**:
   - Go to `/settings`
   - Click the "Integrations" tab

3. **Connect to Xero**:
   - Click "Connect to Xero"
   - Authorize the application
   - Complete the OAuth flow

4. **Test Sync Features**:
   - Sync invoices
   - Sync contacts
   - Sync accounts
   - Create invoice from job

## Production Deployment

### 1. Environment Variables
Set these in your hosting platform (Vercel, Netlify, etc.):

```bash
XERO_CLIENT_ID=your-production-client-id
XERO_CLIENT_SECRET=your-production-client-secret
XERO_REDIRECT_URI=https://yourdomain.com/api/xero/callback
```

### 2. Update Xero App Settings
1. Go to your Xero app in the developer portal
2. Update the redirect URI to your production domain
3. Ensure all required scopes are enabled

### 3. Database Migration
Run the SQL schema in your production Supabase database.

### 4. Webhook Configuration
1. In Xero developer portal, add webhook endpoint:
   - URL: `https://yourdomain.com/api/xero/webhook`
   - Events: `INVOICE`, `CONTACT`

## Security Considerations

### 1. Token Storage
- Store tokens securely in database
- Implement token refresh logic
- Use environment variables for secrets

### 2. Data Privacy
- Only sync necessary data
- Implement data retention policies
- Comply with GDPR requirements

### 3. Access Control
- Pro-only feature access
- User-specific data isolation
- Audit logging for API calls

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**
   - Check redirect URI in Xero app settings
   - Ensure it matches your environment variable

2. **"Authorization failed"**
   - Verify client ID and secret
   - Check required scopes are enabled
   - Ensure app is approved in Xero

3. **"Token expired"**
   - Implement automatic token refresh
   - Check token expiration logic

4. **"Sync failed"**
   - Verify Xero API permissions
   - Check network connectivity
   - Review error logs

### Debug Steps

1. **Check Environment Variables**:
   ```bash
   echo $XERO_CLIENT_ID
   echo $XERO_CLIENT_SECRET
   ```

2. **Test API Connection**:
   ```bash
   curl -X GET "https://api.xero.com/api.xro/2.0/Organisation" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

3. **Review Logs**:
   - Check browser console for errors
   - Review server logs for API issues
   - Monitor Xero API rate limits

## Cost Considerations

### Xero API Limits
- **Free Tier**: 1,000 API calls per day
- **Paid Plans**: Higher limits available
- **Rate Limiting**: Implement exponential backoff

### Implementation Costs
- **Development**: 2-4 hours setup
- **Maintenance**: Minimal ongoing costs
- **API Calls**: Included in Xero subscription

## Best Practices

### 1. Error Handling
- Implement comprehensive error handling
- Provide user-friendly error messages
- Log errors for debugging

### 2. Performance
- Cache frequently accessed data
- Implement pagination for large datasets
- Use background jobs for heavy operations

### 3. User Experience
- Show loading states during operations
- Provide clear success/error feedback
- Implement retry mechanisms

### 4. Data Sync
- Sync only changed data
- Implement conflict resolution
- Maintain data consistency

## Advanced Features

### 1. Automated Invoice Creation
```typescript
// Automatically create invoices when jobs are completed
const createInvoiceFromJob = async (jobId: string) => {
  const job = await getJob(jobId)
  const contact = await findOrCreateXeroContact(job.client)
  
  return await XeroIntegration.createInvoice(connection, {
    contactId: contact.id,
    lineItems: [{
      description: job.title,
      quantity: 1,
      unitPrice: job.amount,
      accountCode: "200" // Revenue account
    }],
    date: job.completionDate,
    dueDate: addDays(job.completionDate, 30),
    reference: `Job ${job.id}`
  })
}
```

### 2. Contact Synchronization
```typescript
// Sync contacts bidirectionally
const syncContacts = async () => {
  const cleanReportClients = await getClients()
  const xeroContacts = await XeroIntegration.getContacts(connection)
  
  // Merge and sync data
  for (const client of cleanReportClients) {
    const xeroContact = xeroContacts.find(c => c.email === client.email)
    if (!xeroContact) {
      await XeroIntegration.createContact(connection, {
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address
      })
    }
  }
}
```

### 3. Financial Reporting
```typescript
// Generate financial reports
const generateFinancialReport = async (dateFrom: string, dateTo: string) => {
  const invoices = await XeroIntegration.getInvoices(connection, {
    dateFrom,
    dateTo
  })
  
  return {
    totalRevenue: invoices.reduce((sum, inv) => sum + inv.total, 0),
    invoiceCount: invoices.length,
    paidInvoices: invoices.filter(inv => inv.status === 'PAID').length,
    outstandingAmount: invoices
      .filter(inv => inv.status !== 'PAID')
      .reduce((sum, inv) => sum + inv.total, 0)
  }
}
```

## Support Resources

- [Xero API Documentation](https://developer.xero.com/docs/)
- [Xero Node.js SDK](https://github.com/XeroAPI/xero-node)
- [Xero Webhooks Guide](https://developer.xero.com/docs/webhooks)
- [Clean Report Support](mailto:support@cleanreport.com)

---

**Need help?** Contact the development team for additional support with the Xero integration. 