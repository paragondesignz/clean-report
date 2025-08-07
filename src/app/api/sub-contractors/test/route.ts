import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    message: 'Sub contractors API is working',
    timestamp: new Date().toISOString()
  })
}
