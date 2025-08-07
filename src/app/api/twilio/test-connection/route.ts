import { NextRequest, NextResponse } from 'next/server'
import { TwilioIntegration } from '@/lib/twilio-integration'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { accountSid, authToken, phoneNumber } = body

    if (!accountSid || !authToken || !phoneNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Test the Twilio credentials by getting account info
    const accountInfo = await TwilioIntegration.getAccountInfo({
      id: '',
      userId: '',
      accountSid,
      authToken,
      phoneNumber,
      isActive: true,
      createdAt: '',
      updatedAt: '',
    })

    return NextResponse.json({
      success: true,
      accountInfo,
    })
  } catch (error) {
    console.error('Twilio test connection error:', error)
    return NextResponse.json({ error: 'Invalid Twilio credentials' }, { status: 400 })
  }
} 