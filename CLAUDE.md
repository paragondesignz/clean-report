# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Clean Report is a modern SaaS web application for cleaning companies to manage client jobs, track tasks with photo documentation, generate professional reports, and handle advanced features like recurring jobs, booking portals, and sub-contractor management. Built with Next.js 15, TypeScript, Supabase, and Tailwind CSS.

## Development Commands

- `npm run dev` - Start development server on port 3001 with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server  
- `npm run lint` - Run ESLint

Note: No test framework is currently configured in this project.

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