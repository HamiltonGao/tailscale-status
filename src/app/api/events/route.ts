import { NextResponse } from 'next/server'
import { getRecentEvents, getUnresolvedEvents, resolveEvent } from '@/db/queries'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const unresolvedOnly = searchParams.get('unresolved') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')

    const events = unresolvedOnly ? await getUnresolvedEvents() : await getRecentEvents(limit)

    return NextResponse.json(
      events.map((e) => ({
        id: e.id,
        type: e.type,
        nodeId: e.nodeId,
        severity: e.severity,
        message: e.message,
        metadata: e.metadata ? JSON.parse(e.metadata) : null,
        timestamp: e.timestamp.getTime(),
        resolvedAt: e.resolvedAt?.getTime() ?? null,
      }))
    )
  } catch (error) {
    console.error('Events API error:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json() as { id: number }
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    await resolveEvent(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Event resolve API error:', error)
    return NextResponse.json({ error: 'Failed to resolve event' }, { status: 500 })
  }
}
