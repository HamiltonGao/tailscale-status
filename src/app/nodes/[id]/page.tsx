import { notFound } from 'next/navigation'
import { NodeDetailClient } from './NodeDetailClient'
import { getNodeByName, getNodeStatusHistory, getPingResultsBetweenNodes, getPingStatsForNode, getAllNodes } from '@/db/queries'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function NodeDetailPage({ params }: PageProps) {
  const { id } = await params
  const nodeName = decodeURIComponent(id)

  try {
    const node = await getNodeByName(nodeName)
    if (!node) {
      notFound()
      return
    }

    const hours = 24
    const [statusHistory, stats, allNodes] = await Promise.all([
      getNodeStatusHistory(node.id, hours),
      getPingStatsForNode(node.id, hours),
      getAllNodes(),
    ])

    // Get ping results to/from this node
    const pingResults = await Promise.all(
      allNodes
        .filter((n) => n.id !== node.id)
        .map(async (targetNode) => {
          const [toTarget, fromTarget] = await Promise.all([
            getPingResultsBetweenNodes(node.id, targetNode.id, hours),
            getPingResultsBetweenNodes(targetNode.id, node.id, hours),
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

    // Transform to Node format
    const nodeData = {
      id: node.id,
      name: node.name,
      hostname: node.hostname || node.name,
      node_id: node.id,
      tailscale_ip: node.tailscaleIp,
      os: (node.os || 'unknown') as 'linux' | 'macOS' | 'windows' | 'android' | 'ios' | 'unknown',
      platform: node.os || 'unknown',
      tags: node.tags ? JSON.parse(node.tags) : [],
      is_online: true,
      last_seen_at: node.lastSeen || node.createdAt,
      created_at: node.createdAt,
      updated_at: node.updatedAt,
      is_exit_node: false,
      is_subnet_router: false,
      raw_metadata: null,
      currentPath: undefined as any,
      currentLatency: null as number | null,
    }

    // Check latest status
    if (statusHistory.length > 0) {
      nodeData.is_online = statusHistory[statusHistory.length - 1].isOnline
      nodeData.last_seen_at = statusHistory[statusHistory.length - 1].timestamp
    }

    // Get average latency from stats
    const totalPings = stats.asSource.totalPings + stats.asTarget.totalPings
    if (totalPings > 0) {
      const sourceAvg = Number(stats.asSource.avgLatency) * stats.asSource.totalPings
      const targetAvg = Number(stats.asTarget.avgLatency) * stats.asTarget.totalPings
      nodeData.currentLatency = (sourceAvg + targetAvg) / totalPings
    }

    // Build latency trend from ping results
    const latencyTrendMap = new Map<number, { latency: number; count: number }>()
    for (const pr of pingResults) {
      for (const p of pr.toTarget) {
        if (p.isReachable && p.latency < 5000) {
          const bucket = Math.floor(p.timestamp / 600000) * 600000
          const existing = latencyTrendMap.get(bucket) || { latency: 0, count: 0 }
          latencyTrendMap.set(bucket, {
            latency: existing.latency + p.latency,
            count: existing.count + 1,
          })
        }
      }
      for (const p of pr.fromTarget) {
        if (p.isReachable && p.latency < 5000) {
          const bucket = Math.floor(p.timestamp / 600000) * 600000
          const existing = latencyTrendMap.get(bucket) || { latency: 0, count: 0 }
          latencyTrendMap.set(bucket, {
            latency: existing.latency + p.latency,
            count: existing.count + 1,
          })
        }
      }
    }
    const latencyTrend = Array.from(latencyTrendMap.entries())
      .map(([timestamp, d]) => ({
        timestamp: new Date(timestamp).toISOString(),
        latency: Math.round((d.latency / d.count) * 10) / 10,
        nodeCount: 1,
      }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    // Build recent probes from ping results
    const recentProbes: Array<{
      timestamp: string
      latency: number | null
      success: boolean
      pathType: string
      target: string
    }> = []
    for (const pr of pingResults) {
      if (pr.toTarget.length > 0) {
        const latest = pr.toTarget[pr.toTarget.length - 1]
        recentProbes.push({
          timestamp: new Date(latest.timestamp).toISOString(),
          latency: latest.isReachable ? latest.latency : null,
          success: latest.isReachable && latest.latency < 5000,
          pathType: latest.connectionType || 'unknown',
          target: pr.targetNodeName,
        })
      }
    }
    recentProbes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Build path history from ping results
    const pathHistory: Array<{
      from: string
      to: string
      timestamp: Date
      duration?: number
    }> = []
    let lastPathType = 'unknown'
    for (const pr of pingResults) {
      for (const p of pr.toTarget) {
        if (p.connectionType && p.connectionType !== lastPathType) {
          pathHistory.push({
            from: lastPathType,
            to: p.connectionType,
            timestamp: new Date(p.timestamp),
          })
          lastPathType = p.connectionType
        }
      }
    }

    // Transform stats to ensure avgLatency is number
    const pingStats = {
      asSource: {
        avgLatency: Number(stats.asSource.avgLatency),
        totalPings: stats.asSource.totalPings,
        successfulPings: stats.asSource.successfulPings,
      },
      asTarget: {
        avgLatency: Number(stats.asTarget.avgLatency),
        totalPings: stats.asTarget.totalPings,
        successfulPings: stats.asTarget.successfulPings,
      },
    }

    return (
      <NodeDetailClient
        node={nodeData}
        latencyTrend={latencyTrend}
        recentProbes={recentProbes.slice(0, 20)}
        pathHistory={pathHistory}
        pingStats={pingStats}
      />
    )
  } catch (error) {
    console.error('Failed to fetch node detail:', error)
    notFound()
  }
}
