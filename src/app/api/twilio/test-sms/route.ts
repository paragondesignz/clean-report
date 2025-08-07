import { NextRequest, NextResponse } from 'next/server'
import { TwilioIntegration } from '@/lib/twilio-integration'
import { supabase } from '@/lib/supabase-client'

export async function POST(request: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { to, body: messageBody } = body

    // Get user's Twilio connection
    const { data: connection, error: connectionError } = await supabase
      .from('twilio_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (connectionError || !connection) {
      return NextResponse.json({ error: 'No active Twilio connection found' }, { status: 400 })
    }

    // Send test SMS
    const smsLog = await TwilioIntegration.sendSms({
      to: to || '+1234567890', // Default test number
      from: connection.phoneNumber,
      body: messageBody || 'Test SMS from Clean Report - Your Twilio integration is working!',
      connection: {
        id: connection.id,
        userId: connection.user_id,
        accountSid: connection.account_sid,
        authToken: connection.auth_token,
        phoneNumber: connection.phone_number,
        isActive: connection.is_active,
        createdAt: connection.created_at,
        updatedAt: connection.updated_at,
      },
    })

    // Save SMS log to database
    const { error: dbError } = await supabase
      .from('twilio_sms_logs')
      .insert({
        user_id: user.id,
        message_sid: smsLog.messageSid,
        to_number: smsLog.toNumber,
        from_number: smsLog.fromNumber,
        message_body: smsLog.messageBody,
        status: smsLog.status,
        sent_at: smsLog.sentAt,
      })

    if (dbError) {
      console.error('Database error:', dbError)
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      success: true,
      messageSid: smsLog.messageSid,
      status: smsLog.status,
    })
  } catch (error) {
    console.error('Twilio test SMS error:', error)
    return NextResponse.json({ error: 'Failed to send test SMS' }, { status: 500 })
  }
} 