import { NextRequest, NextResponse } from 'next/server'
import { StripeIntegration } from '@/lib/stripe-integration'
import { supabase } from '@/lib/supabase-client'

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 500 })
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create a Stripe Connect account link
    const account = await StripeIntegration.createAccount({
      type: 'express',
      country: 'US', // This could be configurable
      email: user.email!,
      business_type: 'company',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    })

    // Save the account info to database
    const { error: dbError } = await supabase
      .from('stripe_connections')
      .upsert({
        user_id: user.id,
        account_id: account.id,
        account_name: account.business_profile?.name || 'Stripe Account',
        is_live: account.charges_enabled,
        is_active: true,
      })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to save connection' }, { status: 500 })
    }

    // Return the account link URL for onboarding
    return NextResponse.json({ 
      url: account.charges_enabled ? '/settings?success=stripe_connected' : account.requirements?.currently_due?.length ? account.requirements?.currently_due : []
    })
  } catch (error) {
    console.error('Stripe connect error:', error)
    return NextResponse.json({ error: 'Failed to connect Stripe' }, { status: 500 })
  }
} 