import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

export function formatListDate(date: string | Date) {
  const d = new Date(date)
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export function formatTime(time: string) {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

export function formatDateTime(date: string, time: string) {
  const dateTime = new Date(`${date}T${time}`)
  return dateTime.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

export function generateReportUrl(reportId: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}/report/${reportId}`
}

export function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Metric measurement formatting functions
export function formatSquareMetres(sqm: number | string) {
  const value = typeof sqm === 'string' ? parseFloat(sqm) : sqm
  if (isNaN(value)) return 'Not specified'
  return `${value} m²`
}

export function formatMetres(metres: number | string) {
  const value = typeof metres === 'string' ? parseFloat(metres) : metres
  if (isNaN(value)) return 'Not specified'
  return `${value} m`
}

export function formatCentimetres(cm: number | string) {
  const value = typeof cm === 'string' ? parseFloat(cm) : cm
  if (isNaN(value)) return 'Not specified'
  return `${value} cm`
}

// Convert square feet to square metres (for backward compatibility)
export function convertSqFtToSqM(sqft: number | string): number {
  const value = typeof sqft === 'string' ? parseFloat(sqft) : sqft
  if (isNaN(value)) return 0
  return Math.round(value * 0.092903 * 100) / 100 // Round to 2 decimal places
}

// Convert feet to metres (for backward compatibility) 
export function convertFtToM(feet: number | string): number {
  const value = typeof feet === 'string' ? parseFloat(feet) : feet
  if (isNaN(value)) return 0
  return Math.round(value * 0.3048 * 100) / 100 // Round to 2 decimal places
} 