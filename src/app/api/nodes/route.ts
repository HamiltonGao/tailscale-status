import { NextResponse } from 'next/server'
import { getAllNodes, getAllLatestNodeStatuses, getPingStatsForNode } from '@/db/queries'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get('includeStats') === 'true'
    const hours = parseInt(searchParams.get('hours') || '24')

    // Exclude dashboard-host from the list
    const EXCLUDED_HOSTNAMES = ['dashboard-host', 'dashboard-host.seagull-company.ts.net']

    const [allNodes, statuses] = await Promise.all([getAllNodes(), getAllLatestNodeStatuses()])

    const nodes = allNodes.filter(n => !EXCLUDED_HOSTNAMES.some(h => n.name.includes(h)))
    const statusMap = new Map(statuses.map((s) => [s.node_id, Boolean(s.is_online)]))

    let result = await Promise.all(
      nodes.map(async (node) => {
        const isOnline = statusMap.get(node.id) ?? false

        let stats = null
        if (includeStats) {
          stats = await getPingStatsForNode(node.id, hours)
        }

        return {
          id: node.id,
          name: node.name,
          hostname: node.hostname,
          tailscale_ip: node.tailscaleIp,
          os: node.os,
          tags: node.tags ? JSON.parse(node.tags) : [],
          is_online: isOnline,
          last_seen: node.lastSeen,
          created_at: node.createdAt,
          stats: stats
            ? {
                avgLatency:
                  (Number(stats.asSource.avgLatency || 0) * stats.asSource.totalPings +
                    Number(stats.asTarget.avgLatency || 0) * stats.asTarget.totalPings) /
                    (stats.asSource.totalPings + stats.asTarget.totalPings) || 0,
                totalPings: stats.asSource.totalPings + stats.asTarget.totalPings,
                successfulPings: stats.asSource.successfulPings + stats.asTarget.successfulPings,
              }
            : undefined,
        }
      })
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Nodes API error:', error)
    return NextResponse.json({ error: 'Failed to fetch nodes' }, { status: 500 })
  }
}
