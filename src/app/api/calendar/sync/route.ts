import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-client'

export async function POST(request: NextRequest) {
  try {
    const { icalUrl, userId } = await request.json()

    if (!icalUrl || !userId) {
      return NextResponse.json(
        { error: 'iCal URL and user ID are required' },
        { status: 400 }
      )
    }

    // Validate URL format
    let url: URL
    try {
      url = new URL(icalUrl)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Check if it's an iCal feed URL
    if (!url.href.includes('/calendar/ical/')) {
      return NextResponse.json(
        { error: 'Please use the iCal feed URL (starts with https://calendar.google.com/calendar/ical/...)' },
        { status: 400 }
      )
    }

    // Fetch the iCal feed from the server
    const response = await fetch(icalUrl, {
      headers: {
        'User-Agent': 'Clean-Report-App/1.0'
      }
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `HTTP ${response.status}: ${response.statusText}` },
        { status: response.status }
      )
    }

    const content = await response.text()

    // Check if it's valid iCal content
    if (!content.includes('BEGIN:VCALENDAR')) {
      return NextResponse.json(
        { error: 'Invalid iCal format' },
        { status: 400 }
      )
    }

    // Parse events from the iCal feed
    const events = parseICalFeed(content)

    // Update the calendar integration with sync timestamp
    const supabase = createServerClient()
    
    // Get existing calendar integration
    const { data: existingIntegration, error: fetchError } = await supabase
      .from('calendar_integrations')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Failed to fetch calendar integration' },
        { status: 500 }
      )
    }

    // Update or create calendar integration
    const updateData = {
      calendar_url: icalUrl,
      last_sync: new Date().toISOString(),
      is_active: true
    }

    let integrationResult
    if (existingIntegration) {
      // Update existing integration
      const { data, error } = await supabase
        .from('calendar_integrations')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        return NextResponse.json(
          { error: 'Failed to update calendar integration' },
          { status: 500 }
        )
      }
      integrationResult = data
    } else {
      // Create new integration
      const { data, error } = await supabase
        .from('calendar_integrations')
        .insert([{
          user_id: userId,
          calendar_url: icalUrl,
          calendar_type: 'google',
          last_sync: new Date().toISOString(),
          is_active: true
        }])
        .select()
        .single()

      if (error) {
        return NextResponse.json(
          { error: 'Failed to create calendar integration' },
          { status: 500 }
        )
      }
      integrationResult = data
    }

    return NextResponse.json({
      success: true,
      message: 'Calendar sync completed successfully',
      eventCount: events.length,
      lastSync: integrationResult.last_sync,
      integration: integrationResult
    })

  } catch (error) {
    console.error('Calendar sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync calendar' },
      { status: 500 }
    )
  }
}

// Parse iCal feed content
function parseICalFeed(icalContent: string): any[] {
  const events: any[] = []
  const lines = icalContent.split('\n')
  
  let currentEvent: any = {}
  let inEvent = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    if (line === 'BEGIN:VEVENT') {
      inEvent = true
      currentEvent = {}
    } else if (line === 'END:VEVENT') {
      if (currentEvent.uid && currentEvent.summary) {
        events.push(currentEvent)
      }
      inEvent = false
      currentEvent = {}
    } else if (inEvent) {
      if (line.startsWith('UID:')) {
        currentEvent.uid = line.substring(4)
      } else if (line.startsWith('SUMMARY:')) {
        currentEvent.summary = line.substring(8)
      } else if (line.startsWith('DESCRIPTION:')) {
        currentEvent.description = line.substring(12)
      } else if (line.startsWith('DTSTART')) {
        const dateStr = line.includes('TZID=') 
          ? line.split(':')[1] 
          : line.split(':')[1]
        currentEvent.start = new Date(dateStr)
      } else if (line.startsWith('DTEND')) {
        const dateStr = line.includes('TZID=') 
          ? line.split(':')[1] 
          : line.split(':')[1]
        currentEvent.end = new Date(dateStr)
      } else if (line.startsWith('LOCATION:')) {
        currentEvent.location = line.substring(9)
      }
    }
  }
  
  return events
} 