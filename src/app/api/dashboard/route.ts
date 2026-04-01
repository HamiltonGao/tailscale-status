import { NextResponse } from 'next/server'
import {
  getDashboardStats,
  getLatencyStats,
  getConnectionTypeStats,
  getRecentIssueCount,
  getLatencyBuckets,
  getOnlineTrend,
  getLatencyTrend,
  getStabilityRanking,
  getLatencyTrendByNode,
  getAllNodes,
} from '@/db/queries'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const hours = parseInt(searchParams.get('hours') || '24')

    const [stats, latencyStats, connectionStats, issues, buckets, onlineTrend, latencyTrend, stability, nodeLatencyTrends] =
      await Promise.all([
        getDashboardStats(),
        getLatencyStats(hours),
        getConnectionTypeStats(hours),
        getRecentIssueCount(hours),
        getLatencyBuckets(hours),
        getOnlineTrend(hours),
        getLatencyTrend(hours),
        getStabilityRanking(hours),
        getLatencyTrendByNode(hours),
      ])

    // Get node names for the latency trends
    const nodes = await getAllNodes()
    const nodeMap = new Map(nodes.map(n => [n.id, n.name]))

    // Attach node names to latency trends
    const nodeLatencyData = nodeLatencyTrends.map(trend => ({
      nodeId: trend.nodeId,
      nodeName: nodeMap.get(trend.nodeId) || trend.nodeId,
      data: trend.data,
      avgLatency: trend.data.length > 0
        ? trend.data.reduce((sum, d) => sum + d.latency, 0) / trend.data.length
        : 0,
    }))

    const avgLatency = latencyStats.avgLatency ?? 0

    return NextResponse.json({
      kpi: {
        totalNodes: stats.totalNodes,
        onlineNodes: stats.onlineNodes,
        offlineNodes: stats.offlineNodes,
        avgLatency: avgLatency > 0 ? Math.round(avgLatency * 10) / 10 : 0,
        directRatio: connectionStats.directRatio,
        recentIssues: issues,
      },
      latencyBuckets: buckets,
      onlineTrend: onlineTrend.map((t) => ({
        timestamp: t.timestamp,
        count: t.online_count,
        online: t.online_count,  // percentage for all, binary for single node
      })),
      latencyTrend: latencyTrend.map((t) => ({
        timestamp: t.timestamp,
        latency: Math.round((t.avg_latency ?? 0) * 10) / 10,
      })),
      stabilityRanking: stability,
      nodeLatencyData,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
