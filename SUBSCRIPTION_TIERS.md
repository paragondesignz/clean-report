# Subscription Tiers Implementation

## Overview

Clean Report now implements subscription tiers that align with the pricing structure shown on the landing page. The app enforces feature restrictions and resource limits based on the user's subscription tier.

## Tier Structure

### Free Tier
- **Price**: $0/month
- **Client Limit**: 5 clients
- **Job Limit**: 20 jobs
- **Report Limit**: 10 reports
- **Recurring Jobs**: 0 (feature disabled)
- **Supplies Limit**: 10 supplies
- **Service Types Limit**: 5 service types
- **Staff Members**: 0 (feature disabled)

**Features Available**:
- Basic job management
- Photo documentation
- Standard reports
- Email support

**Features Disabled**:
- Time tracking
- Recurring jobs
- Branded reports
- API access
- Priority support
- Calendar integration
- Client portal
- Advanced analytics

### Pro Tier
- **Price**: $29/month
- **All Limits**: Unlimited
- **All Features**: Enabled

## Implementation Details

### 1. Database Schema

The `user_profiles` table now includes a `subscription_tier` column:

```sql
ALTER TABLE user_profiles 
ADD COLUMN subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro'));
```

### 2. Subscription Service (`/src/lib/subscription-service.ts`)

Core service that manages tier logic:

- **SubscriptionLimits**: Interface defining limits for each tier
- **SUBSCRIPTION_LIMITS**: Configuration object with all tier limits
- **SubscriptionService**: Class with utility methods for checking access

### 3. React Hook (`/src/hooks/use-subscription.ts`)

Provides easy access to subscription state throughout the app:

```typescript
const { 
  tier, 
  limits, 
  canAccessFeature, 
  canCreateResource, 
  isPro, 
  isFree 
} = useSubscription()
```

### 4. Upgrade Prompt Component (`/src/components/ui/upgrade-prompt.tsx`)

Reusable component that shows when users hit limits or try to access Pro features:

- Shows current usage vs limits
- Lists Pro features
- Displays pricing
- Provides upgrade CTA

## Feature Restrictions Implemented

### 1. Client Management
- **Free**: Limited to 5 clients
- **Pro**: Unlimited clients
- **Implementation**: Checked in `/src/app/(dashboard)/clients/page.tsx`

### 2. Recurring Jobs
- **Free**: Feature completely disabled
- **Pro**: Full access
- **Implementation**: Checked in `/src/app/(dashboard)/recurring/page.tsx`

### 3. Time Tracking
- **Free**: Feature disabled
- **Pro**: Full access
- **Implementation**: To be implemented in job timer components

### 4. Branded Reports
- **Free**: Standard reports only
- **Pro**: Branded reports with custom styling
- **Implementation**: To be implemented in report generation

## Usage Examples

### Checking Feature Access
```typescript
const { canAccessFeature } = useSubscription()

if (canAccessFeature('recurringJobs')) {
  // Show recurring jobs functionality
} else {
  // Show upgrade prompt
}
```

### Checking Resource Limits
```typescript
const { canCreateResource } = useSubscription()

if (canCreateResource('maxClients', currentClientCount)) {
  // Allow creating new client
} else {
  // Show upgrade prompt
}
```

### Showing Upgrade Prompts
```typescript
const { getUpgradeMessage, getFeatureUpgradeMessage } = useSubscription()

// For resource limits
const message = getUpgradeMessage('clients')

// For feature access
const message = getFeatureUpgradeMessage('Recurring Jobs')
```

## Database Migration

Run the following SQL to add the subscription tier column:

```sql
-- Add subscription_tier column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro'));

-- Update existing user profiles to have 'free' tier
UPDATE user_profiles 
SET subscription_tier = 'free' 
WHERE subscription_tier IS NULL;

-- Make the column NOT NULL after setting defaults
ALTER TABLE user_profiles 
ALTER COLUMN subscription_tier SET NOT NULL;

-- Add index for better performance
CREATE INDEX idx_user_profiles_subscription_tier ON user_profiles(subscription_tier);
```

## Future Enhancements

### 1. Payment Integration
- Integrate with Stripe or similar payment processor
- Handle subscription upgrades/downgrades
- Manage billing cycles

### 2. Usage Analytics
- Track feature usage by tier
- Monitor conversion rates
- Analyze user behavior patterns

### 3. Advanced Features
- Team collaboration (Pro only)
- Advanced reporting (Pro only)
- API rate limiting (Free vs Pro)
- Custom integrations (Pro only)

### 4. Trial Management
- 14-day free trial for Pro features
- Trial expiration handling
- Grace period for payment issues

## Testing

### Manual Testing Checklist

- [ ] Free users can create up to 5 clients
- [ ] Free users see upgrade prompt when trying to create 6th client
- [ ] Free users cannot access recurring jobs
- [ ] Free users see upgrade prompt when trying to access Pro features
- [ ] Pro users have unlimited access to all features
- [ ] Upgrade prompts show correct messaging and pricing

### Automated Testing

Consider adding unit tests for:
- SubscriptionService utility methods
- useSubscription hook
- UpgradePrompt component
- Feature access checks in components

## Monitoring

### Key Metrics to Track
- Free to Pro conversion rate
- Feature usage by tier
- Upgrade prompt interactions
- User retention by tier
- Revenue per user

### Error Handling
- Graceful fallback when subscription data is unavailable
- Default to Free tier for new users
- Clear error messages for subscription-related issues 