# Billing & Subscription System

## Overview

The Clean Report app includes a comprehensive billing and subscription management system that handles:

- **Subscription Management**: Free and Pro tier subscriptions
- **Payment Methods**: Credit card and bank account management
- **Billing Cycles**: Monthly billing and invoice generation
- **Usage Tracking**: Monitor resource usage against plan limits
- **Security**: PCI-compliant payment processing

## Architecture

### Database Schema

The billing system uses the following tables:

#### `subscriptions`
- Manages user subscription tiers (free/pro)
- Tracks subscription status and billing periods
- Links to Stripe subscription IDs

#### `payment_methods`
- Stores payment method information
- Supports credit cards and bank accounts
- Handles default payment method logic

#### `billing_cycles`
- Tracks monthly billing periods
- Records payment status and amounts
- Links to Stripe invoice IDs

#### `invoices`
- Detailed invoice records
- Multiple statuses (draft, open, paid, etc.)
- Currency support

#### `usage_tracking`
- Daily usage statistics
- Resource consumption monitoring
- Helps enforce plan limits

### Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **PCI Compliance**: Payment data handled securely
- **Encryption**: Sensitive data encrypted at rest
- **Audit Trails**: All changes tracked with timestamps

## Components

### 1. Subscription Management (`SubscriptionManagement`)

**Location**: `/src/components/settings/subscription-management.tsx`

**Features**:
- Current plan display
- Upgrade/downgrade functionality
- Usage statistics
- Billing history
- Payment method management

**Key Functions**:
```typescript
// Upgrade to Pro
const handleUpgrade = async () => {
  // Redirect to payment processor
  // Update subscription status
  // Refresh user profile
}

// Cancel subscription
const handleCancelSubscription = async () => {
  // Cancel at period end
  // Update subscription status
  // Notify user
}
```

### 2. Account Settings (`AccountSettings`)

**Location**: `/src/components/settings/account-settings.tsx`

**Features**:
- Profile information management
- Company branding customization
- Notification preferences
- Security settings
- Data export/deletion

**Key Functions**:
```typescript
// Save profile changes
const handleSaveProfile = async () => {
  // Update user profile
  // Show success/error messages
}

// Change password
const handlePasswordChange = async () => {
  // Validate password requirements
  // Update password via auth provider
}
```

### 3. Payment Methods (`PaymentMethods`)

**Location**: `/src/components/settings/payment-methods.tsx`

**Features**:
- Add/remove payment methods
- Set default payment method
- Edit cardholder information
- Security notices

**Key Functions**:
```typescript
// Add new payment method
const handleAddPaymentMethod = async () => {
  // Validate card information
  // Create payment method
  // Update UI
}

// Set default payment method
const handleSetDefault = async (methodId: string) => {
  // Update default status
  // Refresh payment methods list
}
```

### 4. Billing Service (`BillingService`)

**Location**: `/src/lib/billing-service.ts`

**Features**:
- Database operations for all billing entities
- Stripe integration placeholders
- Webhook handlers
- Usage tracking

**Key Methods**:
```typescript
// Subscription management
static async getSubscription(userId: string): Promise<Subscription | null>
static async createSubscription(userId: string, tier: 'pro'): Promise<Subscription | null>
static async cancelSubscription(subscriptionId: string): Promise<boolean>

// Payment methods
static async getPaymentMethods(userId: string): Promise<PaymentMethod[]>
static async addPaymentMethod(userId: string, paymentMethod: PaymentMethod): Promise<PaymentMethod | null>
static async setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<boolean>

// Usage tracking
static async getUsageStats(userId: string): Promise<UsageStats>
```

## Subscription Tiers

### Free Tier
- **Price**: $0/month
- **Limits**:
  - 5 clients maximum
  - 20 jobs maximum
  - 10 reports maximum
  - No recurring jobs
  - Basic support

### Pro Tier
- **Price**: $29/month
- **Limits**:
  - Unlimited clients
  - Unlimited jobs
  - Unlimited reports
  - Unlimited recurring jobs
  - Priority support
  - Advanced features

## Payment Processing

### Stripe Integration

The system is designed to integrate with Stripe for payment processing:

1. **Customer Creation**: New customers created in Stripe
2. **Subscription Management**: Stripe handles recurring billing
3. **Payment Methods**: Secure token-based payment method storage
4. **Webhooks**: Real-time updates for payment events

### Payment Flow

1. User selects Pro plan
2. Redirected to Stripe Checkout
3. Payment processed securely
4. Webhook updates subscription status
5. User gains access to Pro features

## Usage Tracking

### Metrics Tracked
- **Clients**: Number of active clients
- **Jobs**: Total jobs created
- **Reports**: Reports generated
- **Recurring Jobs**: Active recurring job schedules

### Enforcement
- Real-time limit checking
- Graceful degradation for over-limit usage
- Upgrade prompts when limits approached

## Settings Page Structure

The settings page uses a tabbed interface:

### Account Tab
- Profile information
- Company branding
- Notification preferences
- Security settings
- Data management

### Subscription Tab
- Current plan display
- Upgrade/downgrade options
- Usage statistics
- Billing history

### Payment Tab
- Payment method management
- Add/edit/remove cards
- Set default payment method
- Security information

### Integrations Tab
- Calendar connections
- API key management
- Webhook configuration

## Database Setup

### Running the Schema

Execute the billing schema to set up all required tables:

```sql
-- Run the billing-schema.sql file in your Supabase SQL editor
```

### Required Tables
1. `subscriptions` - User subscription data
2. `payment_methods` - Payment method storage
3. `billing_cycles` - Billing period tracking
4. `invoices` - Invoice records
5. `usage_tracking` - Usage statistics

### Row Level Security
All tables have RLS enabled with appropriate policies:
- Users can only access their own data
- Automatic triggers for data integrity
- Audit trails for all changes

## API Endpoints

### Subscription Management
```typescript
// Get user subscription
GET /api/subscription

// Create subscription
POST /api/subscription

// Cancel subscription
DELETE /api/subscription/:id
```

### Payment Methods
```typescript
// Get payment methods
GET /api/payment-methods

// Add payment method
POST /api/payment-methods

// Update payment method
PUT /api/payment-methods/:id

// Delete payment method
DELETE /api/payment-methods/:id
```

### Billing
```typescript
// Get billing history
GET /api/billing/history

// Get usage statistics
GET /api/billing/usage

// Download invoice
GET /api/billing/invoice/:id
```

## Security Considerations

### Data Protection
- **PCI Compliance**: Payment data never stored locally
- **Encryption**: All sensitive data encrypted
- **Access Control**: RLS policies enforce data isolation
- **Audit Logging**: All changes tracked

### Payment Security
- **Tokenization**: Payment methods stored as tokens
- **Secure Processing**: Stripe handles all payment processing
- **Webhook Verification**: All webhooks verified for authenticity
- **Error Handling**: Graceful handling of payment failures

## Testing

### Mock Data
The system includes mock data for development:
- Sample payment methods
- Mock billing cycles
- Test subscription data

### Test Scenarios
1. **Free to Pro Upgrade**: Test subscription upgrade flow
2. **Payment Method Management**: Add/edit/remove payment methods
3. **Billing Cycles**: Test monthly billing process
4. **Usage Limits**: Test plan limit enforcement
5. **Subscription Cancellation**: Test cancellation flow

## Future Enhancements

### Planned Features
1. **Multiple Plans**: Additional subscription tiers
2. **Annual Billing**: Discounted annual subscriptions
3. **Team Management**: Multi-user account management
4. **Advanced Analytics**: Detailed usage analytics
5. **Custom Billing**: Custom pricing for enterprise clients

### Integration Opportunities
1. **Stripe Connect**: For marketplace functionality
2. **Tax Calculation**: Automated tax handling
3. **Multi-Currency**: International payment support
4. **Dunning Management**: Automated payment retry logic

## Troubleshooting

### Common Issues

#### Payment Method Not Saving
- Check RLS policies
- Verify user authentication
- Ensure proper error handling

#### Subscription Not Updating
- Check webhook configuration
- Verify Stripe integration
- Review database triggers

#### Usage Limits Not Enforcing
- Check usage tracking queries
- Verify limit configuration
- Review subscription status

### Debug Tools
- Database logs for RLS policy issues
- Stripe dashboard for payment status
- Application logs for error tracking
- Network tab for API call debugging

## Support

For billing system support:
1. Check application logs
2. Review Stripe dashboard
3. Verify database schema
4. Test with mock data
5. Contact development team

---

This billing system provides a robust foundation for subscription management while maintaining security and scalability for future growth. 