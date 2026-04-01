import { sqliteTable, text, integer, index, real } from 'drizzle-orm/sqlite-core'

export const nodes = sqliteTable('nodes', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  hostname: text('hostname'),
  tailscaleIp: text('tailscale_ip').notNull(),
  os: text('os'),
  tags: text('tags'), // JSON string array
  lastSeen: integer('last_seen', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export const nodeStatus = sqliteTable('node_status', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  nodeId: text('node_id').notNull().references(() => nodes.id, { onDelete: 'cascade' }),
  isOnline: integer('is_online', { mode: 'boolean' }).notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
}, (table) => ({
  nodeTimestampIdx: index('node_status_node_timestamp_idx').on(table.nodeId, table.timestamp),
}))

export const pingResults = sqliteTable('ping_results', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  sourceNodeId: text('source_node_id').notNull().references(() => nodes.id, { onDelete: 'cascade' }),
  targetNodeId: text('target_node_id').notNull().references(() => nodes.id, { onDelete: 'cascade' }),
  latencyMs: real('latency_ms').notNull(),
  isReachable: integer('is_reachable', { mode: 'boolean' }).notNull(),
  connectionType: text('connection_type'), // 'direct', 'relay', 'local'
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
}, (table) => ({
  sourceTargetIdx: index('ping_results_source_target_idx').on(table.sourceNodeId, table.targetNodeId, table.timestamp),
  timestampIdx: index('ping_results_timestamp_idx').on(table.timestamp),
}))

export const systemEvents = sqliteTable('system_events', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  type: text('type').notNull(), // 'node_offline', 'node_online', 'high_latency', 'connection_change'
  nodeId: text('node_id').references(() => nodes.id, { onDelete: 'set null' }),
  severity: text('severity').notNull(), // 'info', 'warning', 'error'
  message: text('message').notNull(),
  metadata: text('metadata'), // JSON string
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  resolvedAt: integer('resolved_at', { mode: 'timestamp' }),
}, (table) => ({
  timestampIdx: index('system_events_timestamp_idx').on(table.timestamp),
  typeIdx: index('system_events_type_idx').on(table.type),
}))

export type Node = typeof nodes.$inferSelect
export type NewNode = typeof nodes.$inferInsert
export type NodeStatus = typeof nodeStatus.$inferSelect
export type NewNodeStatus = typeof nodeStatus.$inferInsert
export type PingResult = typeof pingResults.$inferSelect
export type NewPingResult = typeof pingResults.$inferInsert
export type SystemEvent = typeof systemEvents.$inferSelect
export type NewSystemEvent = typeof systemEvents.$inferInsert
