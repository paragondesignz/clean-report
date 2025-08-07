import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({ 
      message: 'Debug endpoint working',
      timestamp: new Date().toISOString(),
      status: 'success'
    })
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({ 
      error: 'Debug endpoint failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
