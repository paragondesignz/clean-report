import type { Client } from './database'

export interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  status: string
  client?: Client
  type: 'job' | 'appointment'
  isRecurring?: boolean
  recurringJobId?: string
}