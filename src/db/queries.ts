import { desc, eq, and, gte, lte, lt, sql, avg, count } from 'drizzle-orm'
import { db, rawDb } from './index'
import * as schema from './schema'

// Node queries
export async function getAllNodes() {
  return await db.select().from(schema.nodes).orderBy(schema.nodes.name)
}

export async function getNodeById(id: string) {
  const [node] = await db.select().from(schema.nodes).where(eq(schema.nodes.id, id)).limit(1)
  return node
}

export async function getNodeByName(name: string) {
  const [node] = await db.select().from(schema.nodes).where(eq(schema.nodes.name, name)).limit(1)
  return node
}

export async function upsertNode(data: schema.NewNode) {
  const existing = await getNodeById(data.id)

  if (existing) {
    const [updated] = await db
      .update(schema.nodes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.nodes.id, data.id))
      .returning()
    return updated
  } else {
    const [inserted] = await db.insert(schema.nodes).values(data).returning()
    return inserted
  }
}

export async function deleteNode(id: string) {
  await db.delete(schema.nodes).where(eq(schema.nodes.id, id))
}

// Node status queries
export async function getLatestNodeStatus(nodeId: string) {
  const [status] = await db
    .select()
    .from(schema.nodeStatus)
    .where(eq(schema.nodeStatus.nodeId, nodeId))
    .orderBy(desc(schema.nodeStatus.timestamp))
    .limit(1)
  return status
}

export async function getAllLatestNodeStatuses() {
  // Get all nodes and their latest status
  const nodes = await getAllNodes()
  const statuses = await Promise.all(
    nodes.map(async (node) => {
      const status = await db
        .select()
        .from(schema.nodeStatus)
        .where(eq(schema.nodeStatus.nodeId, node.id))
        .orderBy(desc(schema.nodeStatus.timestamp))
        .limit(1)
      return status[0]
        ? { node_id: node.id, is_online: status[0].isOnline ? 1 : 0, timestamp: status[0].timestamp }
        : { node_id: node.id, is_online: 0, timestamp: new Date() }
    })
  )
  return statuses
}

export async function recordNodeStatus(data: schema.NewNodeStatus) {
  const [inserted] = await db.insert(schema.nodeStatus).values(data).returning()
  return inserted
}

export async function getNodeStatusHistory(nodeId: string, hours = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000)
  return await db
    .select()
    .from(schema.nodeStatus)
    .where(and(eq(schema.nodeStatus.nodeId, nodeId), gte(schema.nodeStatus.timestamp, since)))
    .orderBy(schema.nodeStatus.timestamp)
}

// Ping queries
export async function recordPingResult(data: schema.NewPingResult) {
  const [inserted] = await db.insert(schema.pingResults).values(data).returning()
  return inserted
}

export async function getPingResults(hours = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000)
  return await db
    .select()
    .from(schema.pingResults)
    .where(gte(schema.pingResults.timestamp, since))
    .orderBy(desc(schema.pingResults.timestamp))
}

export async function getPingResultsBetweenNodes(sourceId: string, targetId: string, hours = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000)
  return await db
    .select()
    .from(schema.pingResults)
    .where(
      and(
        eq(schema.pingResults.sourceNodeId, sourceId),
        eq(schema.pingResults.targetNodeId, targetId),
        gte(schema.pingResults.timestamp, since)
      )
    )
    .orderBy(schema.pingResults.timestamp)
}

export async function getAverageLatency(sourceId: string, targetId: string, hours = 1) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000)
  const [result] = await db
    .select({ avg: avg(schema.pingResults.latencyMs) })
    .from(schema.pingResults)
    .where(
      and(
        eq(schema.pingResults.sourceNodeId, sourceId),
        eq(schema.pingResults.targetNodeId, targetId),
        gte(schema.pingResults.timestamp, since),
        eq(schema.pingResults.isReachable, true)
      )
    )
  return result?.avg ?? null
}

export async function getPingStatsForNode(nodeId: string, hours = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000)

  // As source - only count pings with latency < 5000 as successful
  const [asSource] = await db
    .select({
      avgLatency: avg(schema.pingResults.latencyMs),
      count: count(),
      successCount: count(sql`CASE WHEN is_reachable = 1 AND latency_ms < 5000 THEN 1 END`),
    })
    .from(schema.pingResults)
    .where(and(eq(schema.pingResults.sourceNodeId, nodeId), gte(schema.pingResults.timestamp, since)))

  // As target
  const [asTarget] = await db
    .select({
      avgLatency: avg(schema.pingResults.latencyMs),
      count: count(),
      successCount: count(sql`CASE WHEN is_reachable = 1 AND latency_ms < 5000 THEN 1 END`),
    })
    .from(schema.pingResults)
    .where(and(eq(schema.pingResults.targetNodeId, nodeId), gte(schema.pingResults.timestamp, since)))

  return {
    asSource: {
      avgLatency: asSource?.avgLatency ?? 0,
      totalPings: asSource?.count ?? 0,
      successfulPings: asSource?.successCount ?? 0,
    },
    asTarget: {
      avgLatency: asTarget?.avgLatency ?? 0,
      totalPings: asTarget?.count ?? 0,
      successfulPings: asTarget?.successCount ?? 0,
    },
  }
}

// System events queries
export async function createSystemEvent(data: schema.NewSystemEvent) {
  const [inserted] = await db.insert(schema.systemEvents).values(data).returning()
  return inserted
}

export async function getRecentEvents(limit = 50) {
  return await db
    .select()
    .from(schema.systemEvents)
    .orderBy(desc(schema.systemEvents.timestamp))
    .limit(limit)
}

export async function getUnresolvedEvents() {
  return await db
    .select()
    .from(schema.systemEvents)
    .where(sql`resolved_at IS NULL`)
    .orderBy(desc(schema.systemEvents.timestamp))
}

export async function resolveEvent(id: number) {
  await db
    .update(schema.systemEvents)
    .set({ resolvedAt: new Date() })
    .where(eq(schema.systemEvents.id, id))
}

// Cleanup old data
export async function cleanupOldData(retentionDays = 30) {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000)

  await db.delete(schema.nodeStatus).where(lte(schema.nodeStatus.timestamp, cutoff))
  await db.delete(schema.pingResults).where(lte(schema.pingResults.timestamp, cutoff))
  await db.delete(schema.systemEvents).where(
    and(
      lte(schema.systemEvents.timestamp, cutoff),
      sql`resolved_at IS NOT NULL`
    )
  )
}

// Dashboard aggregations
export async function getDashboardStats() {
  const EXCLUDED_HOSTNAMES = ['dashboard-host', 'dashboard-host.seagull-company.ts.net']

  const nodes = await getAllNodes()
    .then(nodes => nodes.filter(n => !EXCLUDED_HOSTNAMES.some(h => n.name.includes(h))))
  const statuses = await getAllLatestNodeStatuses()

  const statusMap = new Map(statuses.map(s => [s.node_id, Boolean(s.is_online)]))

  const onlineNodes = nodes.filter(n => statusMap.get(n.id) ?? false).length
  const offlineNodes = nodes.length - onlineNodes

  return {
    totalNodes: nodes.length,
    onlineNodes,
    offlineNodes,
  }
}

export async function getLatencyStats(hours = 24) {
  const sinceSeconds = Math.floor(Date.now() / 1000) - hours * 3600

  const stmt = rawDb.prepare(`
    SELECT AVG(latency_ms) as avg_latency
    FROM ping_results
    WHERE timestamp >= ? AND is_reachable = 1 AND latency_ms < 5000
  `)
  const result = stmt.get(sinceSeconds) as { avg_latency: number | null } | undefined

  return {
    avgLatency: result?.avg_latency ?? 0,
  }
}

export async function getConnectionTypeStats(hours = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000)

  const results = await db
    .select({
      connectionType: schema.pingResults.connectionType,
      count: count(),
    })
    .from(schema.pingResults)
    .where(
      and(
        gte(schema.pingResults.timestamp, since),
        eq(schema.pingResults.isReachable, true)
      )
    )
    .groupBy(schema.pingResults.connectionType)

  const total = results.reduce((sum, r) => sum + (r.count ?? 0), 0)
  const directCount = results.find(r => r.connectionType === 'direct')?.count ?? 0

  return {
    directRatio: total > 0 ? Math.round((directCount / total) * 100) : 0,
  }
}

export async function getRecentIssueCount(hours = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000)

  const [result] = await db
    .select({ count: count() })
    .from(schema.systemEvents)
    .where(
      and(
        gte(schema.systemEvents.timestamp, since),
        sql`severity IN ('warning', 'error')`
      )
    )

  return result?.count ?? 0
}

export async function getLatencyBuckets(hours = 24) {
  const sinceSeconds = Math.floor(Date.now() / 1000) - hours * 3600

  const stmt = rawDb.prepare(`
    SELECT latency_ms
    FROM ping_results
    WHERE timestamp >= ? AND is_reachable = 1 AND latency_ms < 5000
  `)
  const results = stmt.all(sinceSeconds) as { latency_ms: number }[]

  const buckets = {
    excellent: 0, // < 10ms
    good: 0, // 10-50ms
    fair: 0, // 50-100ms
    poor: 0, // 100-200ms
    bad: 0, // > 200ms
  }

  for (const r of results) {
    const l = r.latency_ms ?? 0
    if (l < 10) buckets.excellent++
    else if (l < 50) buckets.good++
    else if (l < 100) buckets.fair++
    else if (l < 200) buckets.poor++
    else buckets.bad++
  }

  return buckets
}

export async function getOnlineTrend(hours = 24, nodeId?: string) {
  // Timestamps in DB are in seconds
  const sinceSeconds = Math.floor(Date.now() / 1000) - hours * 3600

  // For "all devices", get percentage of online nodes per 10-min bucket
  // For single node, get binary status per 10-min bucket
  const sql = nodeId
    ? `
      SELECT
        (timestamp / 600) * 600 * 1000 as bucket_time,
        MAX(is_online) as is_online
      FROM node_status
      WHERE timestamp >= ?
      GROUP BY (timestamp / 600), node_id
      ORDER BY bucket_time
    `
    : `
      WITH latest_per_node AS (
        SELECT
          node_id,
          (timestamp / 600) * 600 as bucket_time,
          MAX(is_online) as is_online
        FROM node_status
        WHERE timestamp >= ?
        GROUP BY node_id, (timestamp / 600)
      )
      SELECT
        bucket_time * 1000 as timestamp,
        ROUND(AVG(is_online) * 100) as online_count
      FROM latest_per_node
      GROUP BY bucket_time
      ORDER BY timestamp
    `

  const stmt = rawDb.prepare(sql)
  const results = stmt.all(sinceSeconds) as Array<{ timestamp: number; online_count?: number; is_online?: number }>

  if (results.length === 0) {
    return []
  }

  return results.map(r => ({
    timestamp: r.timestamp,
    online_count: nodeId
      ? (r.is_online ? 1 : 0)
      : (r.online_count || 0),
  }))
}

export async function getLatencyTrend(hours = 24) {
  // Timestamps in DB are in seconds
  const sinceSeconds = Math.floor(Date.now() / 1000) - hours * 3600

  // Use 10-minute aggregation for better granularity
  const stmt = rawDb.prepare(`
    SELECT
      (timestamp / 600) * 600 * 1000 as timestamp,
      AVG(latency_ms) as avg_latency
    FROM ping_results
    WHERE timestamp >= ? AND is_reachable = 1
    GROUP BY (timestamp / 600)
    ORDER BY (timestamp / 600)
  `)
  let results = stmt.all(sinceSeconds) as Array<{ timestamp: number; avg_latency: number }>

  // If no data, return raw recent records
  if (results.length === 0) {
    const rawStmt = rawDb.prepare(`
      SELECT timestamp, latency_ms, is_reachable
      FROM ping_results
      WHERE timestamp >= ?
      ORDER BY timestamp DESC
      LIMIT 100
    `)
    const rawResults = rawStmt.all(sinceSeconds) as Array<{ timestamp: number; latency_ms: number; is_reachable: number }>

    return rawResults.slice(0, 20).map(r => ({
      timestamp: r.timestamp * 1000,
      avg_latency: r.latency_ms,
    }))
  }

  return results
}

export async function getLatencyTrendByNode(hours = 24) {
  // Timestamps in DB are in seconds
  const sinceSeconds = Math.floor(Date.now() / 1000) - hours * 3600

  // Use 10-minute aggregation for better granularity
  // Include both source and target node IDs so we can show latency for any selected node
  const stmt = rawDb.prepare(`
    SELECT
      source_node_id as node_id,
      (timestamp / 600) * 600 * 1000 as timestamp,
      AVG(latency_ms) as avg_latency,
      COUNT(*) as ping_count
    FROM ping_results
    WHERE timestamp >= ? AND is_reachable = 1
    GROUP BY source_node_id, (timestamp / 600)
    ORDER BY (timestamp / 600)
  `)
  const sourceResults = stmt.all(sinceSeconds) as Array<{
    node_id: string
    timestamp: number
    avg_latency: number
    ping_count: number
  }>

  // Also get data as target
  const targetStmt = rawDb.prepare(`
    SELECT
      target_node_id as node_id,
      (timestamp / 600) * 600 * 1000 as timestamp,
      AVG(latency_ms) as avg_latency,
      COUNT(*) as ping_count
    FROM ping_results
    WHERE timestamp >= ? AND is_reachable = 1
    GROUP BY target_node_id, (timestamp / 600)
    ORDER BY (timestamp / 600)
  `)
  const targetResults = targetStmt.all(sinceSeconds) as Array<{
    node_id: string
    timestamp: number
    avg_latency: number
    ping_count: number
  }>

  // Combine source and target data
  const allResults = [...sourceResults, ...targetResults]

  // Group by node
  const nodeTrends = new Map<string, Array<{ timestamp: number; avg_latency: number; ping_count: number }>>()
  for (const row of allResults) {
    const existing = nodeTrends.get(row.node_id) || []
    existing.push({
      timestamp: row.timestamp,
      avg_latency: row.avg_latency,
      ping_count: row.ping_count,
    })
    nodeTrends.set(row.node_id, existing)
  }

  // Convert to array format
  return Array.from(nodeTrends.entries()).map(([nodeId, data]) => ({
    nodeId,
    data: data.map(d => ({
      timestamp: d.timestamp,
      latency: Math.round(d.avg_latency * 10) / 10,
    })),
  }))
}

export async function getStabilityRanking(hours = 24) {
  // Exclude dashboard-host from stability ranking
  const EXCLUDED_HOSTNAMES = ['dashboard-host', 'dashboard-host.seagull-company.ts.net']

  const nodes = await getAllNodes()
    .then(nodes => nodes.filter(n => !EXCLUDED_HOSTNAMES.some(h => n.name.includes(h))))

  const rankings = await Promise.all(
    nodes.map(async (node) => {
      const stats = await getPingStatsForNode(node.id, hours)

      // Calculate uptime percentage - only count pings with latency < 5000 as successful
      const totalPings = stats.asSource.totalPings + stats.asTarget.totalPings
      const successfulPings = stats.asSource.successfulPings + stats.asTarget.successfulPings

      // Uptime is based on successful pings (not timeout)
      const uptime = totalPings > 0 ? (successfulPings / totalPings) * 100 : 0

      // Average latency - only for successful pings
      const sourceLat = Number(stats.asSource.avgLatency ?? 0)
      const targetLat = Number(stats.asTarget.avgLatency ?? 0)
      const avgLatency =
        successfulPings > 0
          ? (sourceLat * stats.asSource.successfulPings + targetLat * stats.asTarget.successfulPings) /
            (stats.asSource.successfulPings + stats.asTarget.successfulPings)
          : 5000 // If no successful pings, show as timeout

      return {
        nodeId: node.id,
        nodeName: node.name,
        uptime: uptime,
        avgLatency: avgLatency,
        totalPings,
      }
    })
  )

  // Sort: timeouts (avgLatency >= 5000) at bottom, then by uptime desc, then latency asc
  return rankings.sort((a, b) => {
    const aIsTimeout = a.avgLatency >= 5000
    const bIsTimeout = b.avgLatency >= 5000

    if (aIsTimeout && !bIsTimeout) return 1
    if (!aIsTimeout && bIsTimeout) return -1

    if (a.uptime !== b.uptime) return b.uptime - a.uptime
    return a.avgLatency - b.avgLatency
  })
}
