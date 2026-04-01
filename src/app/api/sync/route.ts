import { NextResponse } from 'next/server'
import { syncNodesFromTailscale, runPingTests } from '@/lib/tailscale'
import { startScheduler, getSchedulerStatus } from '@/lib/scheduler'

// Auto-start scheduler on first sync request
let schedulerStarted = false

export async function POST(request: Request) {
  try {
    // Auto-start scheduler if not running
    if (!schedulerStarted) {
      const status = getSchedulerStatus()
      if (!status.isInitialized) {
        console.log('[Sync] Auto-starting scheduler...')
        startScheduler()
        schedulerStarted = true
      }
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'

    let results: Record<string, unknown> = {}

    if (type === 'all' || type === 'nodes') {
      const nodesResult = await syncNodesFromTailscale()
      results.nodes = nodesResult
    }

    if (type === 'all' || type === 'ping') {
      const pingResult = await runPingTests()
      results.ping = pingResult
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    })
  } catch (error) {
    console.error('Sync API error:', error)
    return NextResponse.json(
      { error: 'Failed to run sync', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
