'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CalendarEvent } from '@/types/calendar'

interface CalendarViewProps {
  currentDate: Date
  events: CalendarEvent[]
  highlightedRecurringJob: string | null
  onEventClick: (event: CalendarEvent) => void
}

// Week View Component
export function WeekView({ currentDate, events, highlightedRecurringJob, onEventClick }: CalendarViewProps) {
  const startOfWeek = new Date(currentDate)
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek)
    day.setDate(startOfWeek.getDate() + i)
    return day
  })

  const getDayEvents = (day: Date) => {
    const dayStr = day.toISOString().split('T')[0]
    return events.filter(event => event.date === dayStr)
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {/* Day headers */}
          {weekDays.map((day, index) => (
            <div key={index} className="bg-white p-3 text-center">
              <div className="font-medium text-gray-900">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="text-lg font-semibold text-gray-800">
                {day.getDate()}
              </div>
            </div>
          ))}
          
          {/* Day contents */}
          {weekDays.map((day, index) => {
            const dayEvents = getDayEvents(day)
            const isToday = day.toDateString() === new Date().toDateString()
            
            return (
              <div
                key={`day-${index}`}
                className={`bg-white min-h-[200px] p-2 ${
                  isToday ? 'bg-blue-50' : ''
                }`}
              >
                <div className="space-y-1">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className={`p-2 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity ${
                        event.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : event.status === 'in_progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : event.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      } ${
                        highlightedRecurringJob &&
                        event.recurringJobId === highlightedRecurringJob
                          ? 'ring-2 ring-blue-400'
                          : ''
                      }`}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-xs opacity-75">{event.time}</div>
                      {event.client?.name && (
                        <div className="text-xs opacity-75 truncate">{event.client.name}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// Month View Component (existing functionality)
export function MonthView({ currentDate, events, highlightedRecurringJob, onEventClick }: CalendarViewProps) {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for previous month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -(startingDayOfWeek - i - 1))
      days.push({ date: prevDate, isCurrentMonth: false })
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true })
    }

    // Add empty cells for next month to complete the grid (6 rows x 7 days = 42 cells)
    const totalCells = 42
    const remainingCells = totalCells - days.length
    for (let day = 1; day <= remainingCells; day++) {
      days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false })
    }

    return days
  }

  const getDayEvents = (day: Date) => {
    const dayStr = day.toISOString().split('T')[0]
    return events.filter(event => event.date === dayStr)
  }

  const days = getDaysInMonth(currentDate)

  return (
    <Card>
      <CardContent className="p-0">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="bg-white p-3 text-center font-medium text-gray-500">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {days.map(({ date, isCurrentMonth }, index) => {
            const dayEvents = getDayEvents(date)
            const isToday = date.toDateString() === new Date().toDateString()
            
            return (
              <div
                key={index}
                className={`bg-white min-h-[120px] p-2 ${
                  !isCurrentMonth ? 'text-gray-400 bg-gray-50' : ''
                } ${isToday ? 'bg-blue-50' : ''}`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isToday ? 'text-blue-700' : ''
                }`}>
                  {date.getDate()}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className={`p-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity ${
                        event.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : event.status === 'in_progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : event.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      } ${
                        highlightedRecurringJob &&
                        event.recurringJobId === highlightedRecurringJob
                          ? 'ring-1 ring-blue-400'
                          : ''
                      }`}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-xs opacity-75">{event.time}</div>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// Year View Component
export function YearView({ currentDate, events, highlightedRecurringJob, onEventClick }: CalendarViewProps) {
  const year = currentDate.getFullYear()
  const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1))

  const getMonthEvents = (month: Date) => {
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0)
    const startStr = monthStart.toISOString().split('T')[0]
    const endStr = monthEnd.toISOString().split('T')[0]
    
    return events.filter(event => event.date >= startStr && event.date <= endStr)
  }

  const getEventsByStatus = (monthEvents: CalendarEvent[]) => {
    const completed = monthEvents.filter(e => e.status === 'completed').length
    const inProgress = monthEvents.filter(e => e.status === 'in_progress').length
    const scheduled = monthEvents.filter(e => e.status === 'scheduled').length
    const cancelled = monthEvents.filter(e => e.status === 'cancelled').length
    
    return { completed, inProgress, scheduled, cancelled }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
          {months.map((month, index) => {
            const monthEvents = getMonthEvents(month)
            const stats = getEventsByStatus(monthEvents)
            const isCurrentMonth = month.getMonth() === new Date().getMonth() && 
                                   month.getFullYear() === new Date().getFullYear()
            
            return (
              <Card
                key={index}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isCurrentMonth ? 'ring-2 ring-blue-400 bg-blue-50' : ''
                }`}
                onClick={() => onEventClick({ 
                  id: 'month-nav', 
                  date: month.toISOString().split('T')[0],
                  title: month.toLocaleDateString('en-US', { month: 'long' }),
                  time: '',
                  status: 'scheduled',
                  type: 'job'
                } as CalendarEvent)}
              >
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 mb-2">
                      {month.toLocaleDateString('en-US', { month: 'long' })}
                    </div>
                    <div className="text-2xl font-bold text-gray-700 mb-2">
                      {monthEvents.length}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {monthEvents.length === 1 ? 'Job' : 'Jobs'}
                    </div>
                    
                    {monthEvents.length > 0 && (
                      <div className="space-y-1">
                        {stats.completed > 0 && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                            {stats.completed} Completed
                          </Badge>
                        )}
                        {stats.inProgress > 0 && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                            {stats.inProgress} In Progress
                          </Badge>
                        )}
                        {stats.scheduled > 0 && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                            {stats.scheduled} Scheduled
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}