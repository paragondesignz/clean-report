# Clean Report - Integrations Guide

This guide covers all the integrations available in Clean Report for cleaning businesses.

## Overview

Clean Report supports the following integrations:

1. **Stripe** - Payment processing and invoicing
2. **Twilio** - SMS notifications and communication
3. **QuickBooks Online** - Accounting and financial management
4. **Xero** - Alternative accounting software

## Stripe Integration

### Features
- Accept credit card payments from clients
- Create digital invoices
- Recurring billing for regular clients
- Payment tracking and reporting
- Webhook support for real-time updates

### Setup Instructions

1. **Create a Stripe Account**
   - Go to [stripe.com](https://stripe.com) and sign up
   - Complete your business verification
   - Get your API keys from the dashboard

2. **Configure Environment Variables**
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

3. **Connect in Clean Report**
   - Go to Settings → Integrations
   - Click "Connect Stripe Account"
   - Follow the OAuth flow
   - Configure webhook URL: `https://yourdomain.com/api/stripe/webhook`

4. **Test the Integration**
   - Use the "Create Test Payment" button
   - Verify webhook events are received
   - Check payment status updates

### Usage

#### Creating Payments
```typescript
// Create a payment intent
const paymentIntent = await StripeIntegration.createPaymentIntent({
  amount: 5000, // $50.00 in cents
  currency: 'usd',
  description: 'Cleaning service payment',
  metadata: { jobId: 'job-123' }
})
```

#### Handling Webhooks
```typescript
// Webhook events are automatically processed
// Payment status is updated in the database
// Email/SMS notifications are sent
```

## Twilio Integration

### Features
- Send SMS job reminders
- Status update notifications
- Payment reminders
- Bulk SMS campaigns
- Message delivery tracking

### Setup Instructions

1. **Create a Twilio Account**
   - Go to [twilio.com](https://twilio.com) and sign up
   - Get your Account SID and Auth Token
   - Purchase a phone number

2. **Configure Environment Variables**
   ```env
   TWILIO_ACCOUNT_SID=AC1234567890abcdef...
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

3. **Connect in Clean Report**
   - Go to Settings → Integrations
   - Enter your Twilio credentials
   - Test the connection with "Send Test SMS"

4. **Configure SMS Templates**
   - Job reminders are sent automatically
   - Customize message templates
   - Set up delivery preferences

### Usage

#### Sending Job Reminders
```typescript
// Automatic job reminders
await TwilioIntegration.sendJobReminder({
  jobId: 'job-123',
  clientId: 'client-456',
  clientPhone: '+1234567890',
  clientName: 'John Doe',
  jobTitle: 'Weekly Cleaning',
  scheduledDate: '2024-01-15',
  scheduledTime: '09:00'
})
```

#### Status Updates
```typescript
// Send status updates
await TwilioIntegration.sendJobStatusUpdate({
  jobId: 'job-123',
  clientId: 'client-456',
  clientPhone: '+1234567890',
  clientName: 'John Doe',
  jobTitle: 'Weekly Cleaning',
  status: 'completed'
})
```

## QuickBooks Online Integration

### Features
- Sync invoices from Clean Report
- Sync customer data
- Automatic invoice creation
- Financial reporting
- OAuth authentication

### Setup Instructions

1. **Create a QuickBooks App**
   - Go to [developer.intuit.com](https://developer.intuit.com)
   - Create a new app
   - Configure OAuth settings
   - Set redirect URI: `https://yourdomain.com/api/quickbooks/callback`

2. **Configure Environment Variables**
   ```env
   QUICKBOOKS_CLIENT_ID=your_client_id
   QUICKBOOKS_CLIENT_SECRET=your_client_secret
   QUICKBOOKS_REDIRECT_URI=https://yourdomain.com/api/quickbooks/callback
   ```

3. **Connect in Clean Report**
   - Go to Settings → Integrations
   - Click "Connect QuickBooks Account"
   - Authorize the application
   - Select your company file

4. **Test the Integration**
   - Use "Sync Customers" to import existing customers
   - Use "Sync Invoices" to import existing invoices
   - Create a test invoice

### Usage

#### Creating Invoices
```typescript
// Create invoice from job
const invoice = await QuickBooksIntegration.createInvoice({
  customerId: 'customer-123',
  lineItems: [{
    description: 'Weekly Cleaning Service',
    quantity: 1,
    unitPrice: 150.00,
    accountCode: '200'
  }],
  dueDate: '2024-02-15',
  memo: 'Job #123 - Weekly Cleaning'
})
```

#### Syncing Data
```typescript
// Sync customers
const result = await QuickBooksIntegration.syncCustomers(connection, clientIds)

// Sync invoices
const result = await QuickBooksIntegration.syncInvoices(connection, jobIds)
```

## Xero Integration

### Features
- Sync invoices and payments
- Customer management
- Chart of accounts access
- Real-time webhook updates
- Multi-currency support

### Setup Instructions

1. **Create a Xero App**
   - Go to [developer.xero.com](https://developer.xero.com)
   - Create a new app
   - Configure OAuth scopes
   - Set redirect URI: `https://yourdomain.com/api/xero/callback`

2. **Configure Environment Variables**
   ```env
   XERO_CLIENT_ID=your_client_id
   XERO_CLIENT_SECRET=your_client_secret
   XERO_REDIRECT_URI=https://yourdomain.com/api/xero/callback
   ```

3. **Connect in Clean Report**
   - Go to Settings → Integrations
   - Click "Connect to Xero"
   - Authorize the application
   - Select your organization

### Usage

#### Creating Invoices
```typescript
// Create Xero invoice
const invoice = await XeroIntegration.createInvoice({
  contactId: 'contact-123',
  lineItems: [{
    description: 'Cleaning Service',
    quantity: 1,
    unitPrice: 150.00,
    accountCode: '200'
  }],
  date: '2024-01-15',
  dueDate: '2024-02-15'
})
```

## Integration Best Practices

### Security
- Store API keys securely in environment variables
- Use OAuth for authentication when possible
- Implement proper error handling
- Log integration activities for audit trails

### Performance
- Implement rate limiting for API calls
- Cache frequently accessed data
- Use webhooks for real-time updates
- Batch operations when possible

### User Experience
- Provide clear connection status indicators
- Show helpful error messages
- Offer test functionality
- Document integration features

### Data Synchronization
- Implement conflict resolution strategies
- Use timestamps for change tracking
- Provide manual sync options
- Handle offline scenarios gracefully

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check API keys and credentials
   - Verify OAuth redirect URIs
   - Ensure proper scopes are granted

2. **Webhook Failures**
   - Verify webhook URLs are accessible
   - Check signature validation
   - Monitor webhook delivery logs

3. **Sync Issues**
   - Check for data format mismatches
   - Verify required fields are populated
   - Review API rate limits

4. **Payment Failures**
   - Verify Stripe account is properly configured
   - Check payment method support
   - Review error codes and messages

### Debug Steps

1. **Check Logs**
   - Review server logs for errors
   - Monitor API response codes
   - Check database for failed operations

2. **Test Connections**
   - Use test endpoints provided
   - Verify credentials manually
   - Check network connectivity

3. **Validate Data**
   - Ensure data formats match requirements
   - Check for required fields
   - Verify business logic

## Support

For integration support:

1. **Documentation**: Check this guide and API documentation
2. **Logs**: Review server logs for detailed error information
3. **Testing**: Use provided test endpoints to verify functionality
4. **Community**: Check GitHub issues for known problems

## Roadmap

### Planned Features
- [ ] Zapier integration for workflow automation
- [ ] Mailchimp integration for email marketing
- [ ] Calendly integration for scheduling
- [ ] Square integration for POS
- [ ] HubSpot integration for CRM

### Advanced Features
- [ ] Bidirectional sync for all integrations
- [ ] Advanced reporting and analytics
- [ ] Custom webhook configurations
- [ ] Integration marketplace
- [ ] White-label integration options

---

For more information, contact the development team or check the project documentation. 