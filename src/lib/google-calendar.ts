// Google Calendar API integration utilities

export interface GoogleCalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  location?: string
  attendees?: Array<{
    email: string
    displayName?: string
  }>
}

export interface GoogleCalendarConfig {
  clientId: string
  apiKey: string
  calendarId: string
}

// Initialize Google Calendar API
export const initializeGoogleCalendar = (config: GoogleCalendarConfig) => {
  return new Promise<void>((resolve, reject) => {
    // Load Google API client
    const script = document.createElement('script')
    script.src = 'https://apis.google.com/js/api.js'
    script.onload = () => {
      window.gapi.load('client:auth2', () => {
        window.gapi.client.init({
          apiKey: config.apiKey,
          clientId: config.clientId,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
          scope: 'https://www.googleapis.com/auth/calendar.events'
        }).then(() => {
          resolve()
        }).catch(reject)
      })
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
}

// Authenticate with Google Calendar
export const authenticateGoogleCalendar = async () => {
  try {
    const authInstance = window.gapi.auth2.getAuthInstance()
    if (!authInstance.isSignedIn.get()) {
      await authInstance.signIn()
    }
    return true
  } catch (error) {
    console.error('Google Calendar authentication failed:', error)
    return false
  }
}

// Get events from Google Calendar
export const getGoogleCalendarEvents = async (
  calendarId: string,
  timeMin: string,
  timeMax: string
): Promise<GoogleCalendarEvent[]> => {
  try {
    const response = await window.gapi.client.calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime'
    })
    
    return response.result.items || []
  } catch (error) {
    console.error('Failed to fetch Google Calendar events:', error)
    throw error
  }
}

// Create event in Google Calendar
export const createGoogleCalendarEvent = async (
  calendarId: string,
  event: Omit<GoogleCalendarEvent, 'id'>
): Promise<GoogleCalendarEvent> => {
  try {
    const response = await window.gapi.client.calendar.events.insert({
      calendarId,
      resource: event
    })
    
    return response.result
  } catch (error) {
    console.error('Failed to create Google Calendar event:', error)
    throw error
  }
}

// Update event in Google Calendar
export const updateGoogleCalendarEvent = async (
  calendarId: string,
  eventId: string,
  event: Partial<GoogleCalendarEvent>
): Promise<GoogleCalendarEvent> => {
  try {
    const response = await window.gapi.client.calendar.events.update({
      calendarId,
      eventId,
      resource: event
    })
    
    return response.result
  } catch (error) {
    console.error('Failed to update Google Calendar event:', error)
    throw error
  }
}

// Delete event from Google Calendar
export const deleteGoogleCalendarEvent = async (
  calendarId: string,
  eventId: string
): Promise<void> => {
  try {
    await window.gapi.client.calendar.events.delete({
      calendarId,
      eventId
    })
  } catch (error) {
    console.error('Failed to delete Google Calendar event:', error)
    throw error
  }
}

// Parse Google Calendar URL to extract calendar ID
export const parseGoogleCalendarUrl = (url: string): string | null => {
  try {
    // Handle different Google Calendar URL formats
    const patterns = [
      /calendar\.google\.com\/calendar\/embed\?src=([^&]+)/,
      /calendar\.google\.com\/calendar\/u\/0\/r\?cid=([^&]+)/,
      /calendar\.google\.com\/calendar\/u\/0\/r\?src=([^&]+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return decodeURIComponent(match[1])
      }
    }
    
    return null
  } catch (error) {
    console.error('Failed to parse Google Calendar URL:', error)
    return null
  }
}

// Convert cleaning job to Google Calendar event
export const jobToGoogleCalendarEvent = (
  job: { scheduled_date: string; scheduled_time: string; title: string; description: string },
  client: { name: string; address: string; email: string }
): Omit<GoogleCalendarEvent, 'id'> => {
  const startTime = new Date(`${job.scheduled_date}T${job.scheduled_time}`)
  const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000) // 2 hours duration
  
  return {
    summary: `${job.title} - ${client.name}`,
    description: job.description,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    location: client.address,
    attendees: [
      {
        email: client.email,
        displayName: client.name
      }
    ]
  }
}

// Sync jobs with Google Calendar
export const syncJobsWithGoogleCalendar = async (
  jobs: Array<{ id: string; scheduled_date: string; scheduled_time: string; title: string; description: string; client_id: string }>,
  clients: Array<{ id: string; name: string; address: string; email: string }>,
  calendarId: string
): Promise<void> => {
  try {
    // Authenticate first
    const isAuthenticated = await authenticateGoogleCalendar()
    if (!isAuthenticated) {
      throw new Error('Failed to authenticate with Google Calendar')
    }
    
    // Get existing events for the next 30 days
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    
    const existingEvents = await getGoogleCalendarEvents(
      calendarId,
      now.toISOString(),
      thirtyDaysFromNow.toISOString()
    )
    
    // Create a map of existing events by job ID
    const existingEventMap = new Map<string, GoogleCalendarEvent>()
    existingEvents.forEach(event => {
      const jobId = event.description?.match(/Job ID: (\w+)/)?.[1]
      if (jobId) {
        existingEventMap.set(jobId, event)
      }
    })
    
    // Sync each job
    for (const job of jobs) {
      const client = clients.find(c => c.id === job.client_id)
      if (!client) continue
      
      const eventData = jobToGoogleCalendarEvent(job, client)
      
      if (existingEventMap.has(job.id)) {
        // Update existing event
        const existingEvent = existingEventMap.get(job.id)
        if (existingEvent) {
          await updateGoogleCalendarEvent(calendarId, existingEvent.id, eventData)
        }
      } else {
        // Create new event
        await createGoogleCalendarEvent(calendarId, eventData)
      }
    }
    
    // Remove events for jobs that no longer exist
    for (const [jobId, event] of existingEventMap.entries()) {
      if (!jobs.find(j => j.id === jobId)) {
        await deleteGoogleCalendarEvent(calendarId, event.id)
      }
    }
  } catch (error) {
    console.error('Failed to sync jobs with Google Calendar:', error)
    throw error
  }
}

// iCal Feed Integration (Simpler alternative to Google Calendar API)
export interface ICalEvent {
  uid: string
  summary: string
  description?: string
  start: Date
  end: Date
  location?: string
  attendees?: string[]
}

// Parse iCal feed content
export const parseICalFeed = (icalContent: string): ICalEvent[] => {
  const events: ICalEvent[] = []
  const lines = icalContent.split('\n')
  
  let currentEvent: Partial<ICalEvent> = {}
  let inEvent = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    if (line === 'BEGIN:VEVENT') {
      inEvent = true
      currentEvent = {}
    } else if (line === 'END:VEVENT') {
      if (currentEvent.uid && currentEvent.summary && currentEvent.start && currentEvent.end) {
        events.push(currentEvent as ICalEvent)
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
      } else if (line.startsWith('ATTENDEE:')) {
        if (!currentEvent.attendees) currentEvent.attendees = []
        currentEvent.attendees.push(line.substring(9))
      }
    }
  }
  
  return events
}

// Fetch events from iCal feed
export const fetchICalEvents = async (icalUrl: string): Promise<ICalEvent[]> => {
  try {
    const response = await fetch(icalUrl)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const content = await response.text()
    
    if (!content.includes('BEGIN:VCALENDAR')) {
      throw new Error('Invalid iCal format')
    }
    
    return parseICalFeed(content)
  } catch (error) {
    console.error('Failed to fetch iCal events:', error)
    throw error
  }
}

// Test iCal feed connection
export const testICalConnection = async (icalUrl: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch('/api/calendar/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ icalUrl })
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to test calendar connection'
      }
    }

    return {
      success: data.success,
      error: data.error
    }
  } catch (error) {
    console.error('iCal connection test failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to test calendar connection'
    }
  }
}

// Sync calendar events
export const syncCalendarEvents = async (icalUrl: string, userId: string): Promise<{ success: boolean; error?: string; eventCount?: number; lastSync?: string }> => {
  try {
    const response = await fetch('/api/calendar/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ icalUrl, userId })
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to sync calendar events'
      }
    }

    return {
      success: data.success,
      eventCount: data.eventCount,
      lastSync: data.lastSync,
      error: data.error
    }
  } catch (error) {
    console.error('Calendar sync failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sync calendar events'
    }
  }
}

// Convert cleaning job to iCal event format
export const jobToICalEvent = (
  job: { id: string; scheduled_date: string; scheduled_time: string; title: string; description: string },
  client: { name: string; address: string; email: string }
): string => {
  const startTime = new Date(`${job.scheduled_date}T${job.scheduled_time}`)
  const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000) // 2 hours duration
  
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }
  
  return [
    'BEGIN:VEVENT',
    `UID:clean-report-${job.id}`,
    `SUMMARY:${job.title} - ${client.name}`,
    `DESCRIPTION:${job.description}`,
    `DTSTART:${formatDate(startTime)}`,
    `DTEND:${formatDate(endTime)}`,
    `LOCATION:${client.address}`,
    `ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${client.email}`,
    'END:VEVENT'
  ].join('\r\n')
}

// Declare global gapi for TypeScript
declare global {
  interface Window {
    gapi: {
      load: (api: string, callback: () => void) => void
      client: {
        init: (config: { apiKey: string; clientId: string; discoveryDocs: string[]; scope: string }) => Promise<void>
        calendar: {
          events: {
            list: (params: { calendarId: string; timeMin: string; timeMax: string; singleEvents: boolean; orderBy: string }) => Promise<{ result: { items: GoogleCalendarEvent[] } }>
            insert: (params: { calendarId: string; resource: Omit<GoogleCalendarEvent, 'id'> }) => Promise<{ result: GoogleCalendarEvent }>
            update: (params: { calendarId: string; eventId: string; resource: Partial<GoogleCalendarEvent> }) => Promise<{ result: GoogleCalendarEvent }>
            delete: (params: { calendarId: string; eventId: string }) => Promise<void>
          }
        }
      }
      auth2: {
        getAuthInstance: () => {
          isSignedIn: {
            get: () => boolean
          }
          signIn: () => Promise<void>
        }
      }
    }
  }
} 