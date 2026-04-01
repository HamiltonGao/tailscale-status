import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import { existsSync, mkdirSync } from 'fs'
import { dirname } from 'path'

const dbPath = process.env.DATABASE_PATH || './data/tailscale-dashboard.db'

// Ensure data directory exists
const dbDir = dirname(dbPath)
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true })
}

const sqlite = new Database(dbPath)

export const db = drizzle(sqlite, { schema })

// Export raw SQLite instance for custom queries
export const rawDb = sqlite

export default db
