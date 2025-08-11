# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Clean Report is a modern SaaS web application for cleaning companies to manage client jobs, track tasks with photo documentation, generate professional reports, and handle advanced features like recurring jobs, booking portals, and sub-contractor management. Built with Next.js 15, TypeScript, Supabase, and Tailwind CSS.

## Development Commands

- `npm run dev` - Start development server on port 3001 with Turbopack
- `npm run build` - Build for production (currently failing due to some type errors - see Critical Issues below)
- `npm run start` - Start production server  
- `npm run lint` - Run ESLint (will show many warnings but no critical errors)

Note: No test framework is currently configured in this project.

## Critical Build Issues to Address

**Current Status**: The build is failing due to TypeScript errors. Key issues include:
1. Null vs undefined type mismatches (e.g., `number | null` vs `number | undefined`)
2. Next.js 15 parameter changes - some API routes still use old sync parameter format
3. Unused variables and imports creating linting warnings (non-critical)
4. React Hook dependency issues (warnings only)

**Priority fixes needed**:
- Fix `job.agreed_hours` type mismatch in `src/app/(dashboard)/jobs/[id]/page.tsx:1073`
- Complete migration of remaining API routes to async parameters
- Address critical React Hook warnings in sub-contractors components

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **UI**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **AI Services**: Google Generative AI, OpenAI
- **Payments**: Stripe integration
- **Email**: Resend API
- **Integrations**: Xero accounting, Google Calendar

### Database Architecture
The application uses Supabase with comprehensive database schema including:

**Core Tables**: `clients`, `jobs`, `tasks`, `photos`, `notes`, `reports`, `user_profiles`

**Advanced Features**: `recurring_jobs`, `feedback`, `supplies`, `job_supplies`, `staff_members`, `job_assignments`, `booking_requests`, `calendar_integrations`, `service_types`, `sub_contractors` (interface-only)

All tables implement Row Level Security (RLS) and are filtered by `user_id` for multi-tenant architecture.

### File Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Protected routes with shared layout
│   ├── booking/[token]/   # Public booking portal
│   ├── feedback/[token]/  # Customer feedback forms
│   └── api/               # API routes
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Authentication components
│   ├── ai/               # AI-powered features
│   ├── integrations/     # Third-party integrations
│   └── settings/         # User settings components
├── lib/                  # Utilities and services
├── types/                # TypeScript definitions
└── hooks/                # Custom React hooks
```

### Key Services

**Database Client** (`src/lib/supabase-client.ts`): Comprehensive database operations with proper error handling and user authentication checks.

**AI Services** (`src/lib/ai-*.ts`): Photo analysis, quote generation, and other AI-powered features.

**Integration Services**: Xero accounting, Google Calendar sync, email notifications.

**Subscription System**: Tier-based access control with free/pro tiers.

## Important Implementation Notes

### Authentication & Security
- All database operations require user authentication
- RLS policies ensure users only access their own data
- Service role client available for admin operations
- Authentication handled via Supabase Auth with AuthProvider

### State Management
- React Context for auth, notifications, subscriptions
- Real-time updates via Supabase subscriptions
- Custom hooks for common operations

### Error Handling
- Comprehensive error handling in all database operations
- Detailed logging for debugging
- User-friendly error messages via toast notifications

### Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (optional - for maps functionality)
GOOGLE_GENERATIVE_AI_API_KEY (for AI features)
OPENAI_API_KEY (for AI features) 
STRIPE_SECRET_KEY (for payment processing)
STRIPE_WEBHOOK_SECRET (for payment webhooks)
XERO_CLIENT_ID / XERO_CLIENT_SECRET (for Xero integration)
TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN (for SMS notifications)
```

## Development Guidelines

### Database Operations
- Always use the functions in `src/lib/supabase-client.ts`
- Never bypass user authentication checks
- Handle errors gracefully with user feedback
- Use proper TypeScript types from `src/types/database.ts`

### Component Development
- Follow existing patterns in `src/components/ui/`
- Use shadcn/ui components as base
- Implement proper loading states and error handling
- Follow mobile-first responsive design

### API Development
- API routes handle public-facing endpoints (booking, feedback)
- Protected operations should use client-side database functions
- Implement proper validation and error responses

### Styling
- Use Tailwind CSS utility classes
- Follow existing design system patterns
- Ensure mobile responsiveness
- Use CSS custom properties for theme colors

## Common Patterns

### Data Fetching
```typescript
const [data, setData] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState('')

useEffect(() => {
  const fetchData = async () => {
    try {
      const result = await getClients()
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  fetchData()
}, [])
```

### Form Handling
Forms use `react-hook-form` with `zod` validation and shadcn/ui components.

### Toast Notifications
Use `useToast()` hook for user feedback on operations.

### Subscription Checks
Use `useSubscription()` hook for tier-based feature access control.

## Next.js 15 Specific Considerations

This project uses Next.js 15 with App Router. Important patterns:

### Async Route Parameters
In Next.js 15, route parameters are promises. Use this pattern for dynamic routes:

```typescript
// Pages with dynamic routes
export default async function PageName({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // ... rest of component
}

// API routes with parameters  
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // ... rest of handler
}
```

### Multi-Modal Architecture
The application has several distinct operational modes:

1. **Dashboard Mode** (`/dashboard/*`) - Main admin interface for cleaning companies
2. **Mobile Worker Mode** (`/mobile-job/*`) - Field worker interface for job updates
3. **Customer Portal** (`/customer-portal/*`) - Client-facing interface
4. **Public Booking** (`/booking/*`) - Anonymous booking system
5. **Feedback Collection** (`/feedback/*`) - Customer feedback forms
6. **Sub-contractor Interface** (`/sub-contractor/*`) - External contractor management

### Key Architectural Patterns

**Token-Based Public Access**: Booking and feedback use cryptographic tokens for secure anonymous access.

**Real-time Updates**: Supabase subscriptions provide live updates for job status, photos, and notifications.

**AI Integration**: Multiple AI services (Google Gemini, OpenAI) for photo analysis, quote generation, and task suggestions.

**Multi-tenant Security**: All operations filtered by `user_id` with Row Level Security policies.

## Integration Services Architecture

**Email Service** (`src/lib/email-service.ts`): Uses Resend API for transactional emails.

**Payment Processing** (`src/lib/stripe-integration.ts`): Handles subscription billing and payment processing.

**Calendar Sync** (`src/lib/google-calendar.ts`): Bidirectional calendar integration for job scheduling.

**SMS Notifications** (`src/lib/twilio-integration.ts`): Customer and worker notifications.

**Accounting Integration** (`src/lib/xero-integration.ts`): Automatic invoice and client sync.