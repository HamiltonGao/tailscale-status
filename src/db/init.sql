-- Initialize Tailscale Dashboard Database

CREATE TABLE IF NOT EXISTS nodes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  hostname TEXT,
  tailscale_ip TEXT NOT NULL,
  os TEXT,
  tags TEXT,
  last_seen INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS node_status (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  node_id TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  is_online INTEGER NOT NULL,
  timestamp INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS node_status_node_timestamp_idx ON node_status(node_id, timestamp);

CREATE TABLE IF NOT EXISTS ping_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_node_id TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  target_node_id TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  latency_ms REAL NOT NULL,
  is_reachable INTEGER NOT NULL,
  connection_type TEXT,
  timestamp INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS ping_results_source_target_idx ON ping_results(source_node_id, target_node_id, timestamp);
CREATE INDEX IF NOT EXISTS ping_results_timestamp_idx ON ping_results(timestamp);

CREATE TABLE IF NOT EXISTS system_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  node_id TEXT REFERENCES nodes(id) ON DELETE SET NULL,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata TEXT,
  timestamp INTEGER NOT NULL,
  resolved_at INTEGER
);

CREATE INDEX IF NOT EXISTS system_events_timestamp_idx ON system_events(timestamp);
CREATE INDEX IF NOT EXISTS system_events_type_idx ON system_events(type);
