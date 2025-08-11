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

    const body = await request.json()
    const { amount, currency, description } = body

    // Get user's Stripe connection
    const { data: connection, error: connectionError } = await supabase
      .from('stripe_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (connectionError || !connection) {
      return NextResponse.json({ error: 'No active Stripe connection found' }, { status: 400 })
    }

    // Create a test payment intent
    const paymentIntent = await StripeIntegration.createPaymentIntent({
      amount: amount || 1000, // $10.00 default
      currency: currency || 'usd',
      description: description || 'Test payment from Clean Report',
      paymentMethodTypes: ['card'],
      metadata: {
        userId: user.id,
        test: 'true',
      },
    })

    // Save payment record to database
    const { error: dbError } = await supabase
      .from('stripe_payments')
      .insert({
        user_id: user.id,
        stripe_payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        client_secret: paymentIntent.client_secret,
        payment_method_types: paymentIntent.payment_method_types,
      })

    if (dbError) {
      console.error('Database error:', dbError)
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('Stripe test payment error:', error)
    return NextResponse.json({ error: 'Failed to create test payment' }, { status: 500 })
  }
} 