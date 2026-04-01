import { NextResponse } from 'next/server'
import { getSchedulerStatus, startScheduler, stopScheduler } from '@/lib/scheduler'

let isRunning = false

export async function GET() {
  const status = getSchedulerStatus()
  return NextResponse.json({ ...status, isRunning })
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { action: 'start' | 'stop' }
    const { action } = body

    if (action === 'start') {
      if (!isRunning) {
        startScheduler()
        isRunning = true
      }
      return NextResponse.json({ success: true, message: 'Scheduler started' })
    }

    if (action === 'stop') {
      if (isRunning) {
        stopScheduler()
        isRunning = false
      }
      return NextResponse.json({ success: true, message: 'Scheduler stopped' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Scheduler API error:', error)
    return NextResponse.json({ error: 'Failed to control scheduler' }, { status: 500 })
  }
}
