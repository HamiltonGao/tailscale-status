# Tailscale Status

[![CI](https://github.com/tailscale-status/tailscale-status/actions/workflows/ci.yml/badge.svg)](https://github.com/tailscale-status/tailscale-status/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker Pulls](https://img.shields.io/docker/pulls/tailscale-status/tailscale-dashboard.svg)](https://hub.docker.com/r/tailscale-status/tailscale-dashboard)

A modern, premium web dashboard for monitoring your Tailscale tailnet. Built with Next.js, TypeScript, Tailwind CSS, and SQLite.

## Features

- **Real-time Node Monitoring**: View all Tailscale nodes in your tailnet
- **Ping Latency Tracking**: Monitor network latency with historical trends
- **Connection Path Detection**: Visualize Direct, DERP, and Peer Relay connections
- **Node Stability Rankings**: Track which nodes are most reliable
- **Historical Data**: SQLite-based storage with configurable retention
- **Modern UI**: Premium, observability-style interface with dark mode
- **Docker Support**: One-command deployment with Docker Compose

## Quick Start

### Prerequisites

- Docker and Docker Compose
- A Tailscale API key ([get one here](https://login.tailscale.com/admin/settings/api))

### Using Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/tailscale-status/tailscale-status.git
cd tailscale-status
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your Tailscale API credentials
```

3. Build and start the dashboard:
```bash
docker-compose up -d --build
```

4. Access the dashboard at http://localhost:1212

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your settings
```

3. Run the development server:
```bash
npm run dev
```

4. Open http://localhost:3000

## Configuration

| Environment Variable | Description | Default |
|---------------------|-------------|---------|
| `TAILSCALE_API_KEY` | Tailscale API key | Required |
| `TAILSCALE_TAILNET` | Your tailnet name (e.g., example.ts.net) | Required |
| `DATABASE_PATH` | SQLite database path | ./data/tailscale-dashboard.db |
| `NODE_SYNC_INTERVAL_SEC` | Node sync interval (seconds) | 10 |
| `PING_POLLING_INTERVAL_SEC` | Ping interval (seconds) | 30 |
| `PING_TIMEOUT_MS` | Ping timeout (milliseconds) | 5000 |
| `DATA_RETENTION_DAYS` | Data retention period (days) | 30 |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dashboard` | GET | Dashboard statistics and KPIs |
| `/api/nodes` | GET | List all nodes |
| `/api/nodes/[name]` | GET | Get node details by name |
| `/api/events` | GET | Get system events |
| `/api/sync` | POST | Trigger manual sync |
| `/api/scheduler` | GET/POST | Get or control scheduler |
| `/api/health` | GET | Health check |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Tailscale Status                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │  Frontend   │    │   API /     │    │  Scheduler  │    │
│  │  (Next.js)  │    │   Routes    │    │  (Ping/Sync)│    │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    │
│         │                   │                   │            │
│         └───────────────────┼───────────────────┘            │
│                             │                                │
│                    ┌────────▼────────┐                     │
│                    │     SQLite       │                     │
│                    │   Database       │                     │
│                    └─────────────────┘                     │
│                                                              │
│         ┌────────────────────────────────┐                   │
│         │   Tailscale CLI / API          │                   │
│         └────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Charts**: Recharts
- **Backend**: Next.js API Routes
- **Database**: SQLite with Drizzle ORM
- **Container**: Docker, Docker Compose
- **Icons**: Lucide React

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## Security

See [SECURITY.md](SECURITY.md) for security policies.

## License

MIT License - see [LICENSE](LICENSE) for details.
