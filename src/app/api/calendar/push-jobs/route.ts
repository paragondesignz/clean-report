import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-client'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    
    // Get calendar integration
    const { data: integration, error: integrationError } = await supabase
      .from('calendar_integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (integrationError || !integration?.calendar_url) {
      return NextResponse.json(
        { error: 'No active calendar integration found' },
        { status: 400 }
      )
    }

    // Get user's scheduled jobs with client info
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        description,
        scheduled_date,
        scheduled_time,
        status,
        client_id,
        clients (
          name,
          address,
          email
        )
      `)
      .eq('user_id', userId)
      .not('scheduled_date', 'is', null)
      .not('scheduled_time', 'is', null)
      .gte('scheduled_date', new Date().toISOString().split('T')[0])

    if (jobsError) {
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: 500 }
      )
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No scheduled jobs to sync',
        eventCount: 0
      })
    }

    // Generate iCal content with all jobs
    const icalContent = generateJobsICal(jobs)

    // For now, we'll save the iCal content to the database
    // In a production environment, you'd want to:
    // 1. Use Google Calendar API with OAuth2
    // 2. Or provide an iCal feed URL that the user can subscribe to in Google Calendar

    const { error: updateError } = await supabase
      .from('calendar_integrations')
      .update({
        last_sync: new Date().toISOString(),
        sync_data: icalContent
      })
      .eq('user_id', userId)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update calendar integration' },
        { status: 500 }
      )
    }

    // Generate a public iCal feed URL for the user to subscribe to in Google Calendar
    const feedUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/feed/${userId}`

    return NextResponse.json({
      success: true,
      message: 'Jobs synced to calendar feed',
      eventCount: jobs.length,
      feedUrl,
      instructions: [
        '1. Copy the feed URL provided',
        '2. Open Google Calendar',
        '3. Click the + next to "Other calendars"', 
        '4. Select "From URL"',
        '5. Paste the feed URL and click "Add calendar"',
        '6. Your Clean Report jobs will appear as calendar events'
      ]
    })

  } catch (error) {
    console.error('Calendar push error:', error)
    return NextResponse.json(
      { error: 'Failed to push jobs to calendar' },
      { status: 500 }
    )
  }
}

function generateJobsICal(jobs: any[]): string {
  const now = new Date()
  const icalHeader = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Clean Report//Calendar Integration//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Clean Report Jobs',
    'X-WR-TIMEZONE:' + Intl.DateTimeFormat().resolvedOptions().timeZone
  ]

  const icalFooter = ['END:VCALENDAR']

  const events = jobs.map(job => {
    if (!job.scheduled_date || !job.scheduled_time) return ''
    
    const startTime = new Date(`${job.scheduled_date}T${job.scheduled_time}`)
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000) // 2 hours duration
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const client = job.clients
    const summary = `${job.title}${client ? ` - ${client.name}` : ''}`
    const description = [
      job.description || '',
      `Status: ${job.status || 'Scheduled'}`,
      `Job ID: ${job.id}`
    ].filter(Boolean).join('\\n')

    return [
      'BEGIN:VEVENT',
      `UID:clean-report-${job.id}@cleanreport.app`,
      `DTSTART:${formatDate(startTime)}`,
      `DTEND:${formatDate(endTime)}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      client?.address ? `LOCATION:${client.address}` : '',
      'TRANSP:OPAQUE',
      'STATUS:CONFIRMED',
      `CREATED:${formatDate(now)}`,
      `LAST-MODIFIED:${formatDate(now)}`,
      'SEQUENCE:0',
      'END:VEVENT'
    ].filter(Boolean).join('\r\n')
  }).filter(Boolean)

  return [...icalHeader, ...events, ...icalFooter].join('\r\n')
}