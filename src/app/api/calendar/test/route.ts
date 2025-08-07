import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { icalUrl } = await request.json()

    if (!icalUrl) {
      return NextResponse.json(
        { error: 'iCal URL is required' },
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

    // Parse events to verify the feed is working
    const events = parseICalFeed(content)

    return NextResponse.json({
      success: true,
      message: 'Calendar feed is accessible and valid',
      eventCount: events.length
    })

  } catch (error) {
    console.error('Calendar test error:', error)
    return NextResponse.json(
      { error: 'Failed to test calendar connection' },
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