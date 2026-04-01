import { NextResponse } from 'next/server'
import { getNodeById, getNodeStatusHistory, getPingResultsBetweenNodes, getPingStatsForNode } from '@/db/queries'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const hours = parseInt(searchParams.get('hours') || '24')

    const node = await getNodeById(id)
    if (!node) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 })
    }

    const [statusHistory, stats] = await Promise.all([
      getNodeStatusHistory(id, hours),
      getPingStatsForNode(id, hours),
    ])

    // Get all nodes for ping targets
    const { getAllNodes } = await import('@/db/queries')
    const allNodes = await getAllNodes()

    // Get ping results to/from this node
    const pingResults = await Promise.all(
      allNodes
        .filter((n) => n.id !== id)
        .map(async (targetNode) => {
          const [toTarget, fromTarget] = await Promise.all([
            getPingResultsBetweenNodes(id, targetNode.id, hours),
            getPingResultsBetweenNodes(targetNode.id, id, hours),
          ])

          return {
            targetNodeId: targetNode.id,
            targetNodeName: targetNode.name,
            toTarget: toTarget.map((p) => ({
              timestamp: p.timestamp.getTime(),
              latency: p.latencyMs,
              isReachable: p.isReachable,
              connectionType: p.connectionType,
            })),
            fromTarget: fromTarget.map((p) => ({
              timestamp: p.timestamp.getTime(),
              latency: p.latencyMs,
              isReachable: p.isReachable,
              connectionType: p.connectionType,
            })),
          }
        })
    )

    return NextResponse.json({
      node: {
        id: node.id,
        name: node.name,
        hostname: node.hostname,
        tailscale_ip: node.tailscaleIp,
        os: node.os,
        tags: node.tags ? JSON.parse(node.tags) : [],
        last_seen: node.lastSeen,
        created_at: node.createdAt,
      },
      statusHistory: statusHistory.map((s) => ({
        timestamp: s.timestamp.getTime(),
        isOnline: s.isOnline,
      })),
      stats: {
        asSource: stats.asSource,
        asTarget: stats.asTarget,
      },
      pingResults,
    })
  } catch (error) {
    console.error('Node detail API error:', error)
    return NextResponse.json({ error: 'Failed to fetch node details' }, { status: 500 })
  }
}
