import { NextRequest, NextResponse } from 'next/server'
import { StripeIntegration } from '@/lib/stripe-integration'
import { supabase } from '@/lib/supabase-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 })
    }

    // Verify and handle the webhook
    const event = await StripeIntegration.handleWebhook(body, signature)

    // Update payment status in database based on event type
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as any
      
      const { error } = await supabase
        .from('stripe_payments')
        .update({ 
          status: 'succeeded',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_payment_intent_id', paymentIntent.id)

      if (error) {
        console.error('Error updating payment status:', error)
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as any
      
      const { error } = await supabase
        .from('stripe_payments')
        .update({ 
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_payment_intent_id', paymentIntent.id)

      if (error) {
        console.error('Error updating payment status:', error)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 })
  }
} 