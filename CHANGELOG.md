# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-03-25

### Added

- Real-time node monitoring dashboard
- Ping latency tracking with historical trends
- Connection path detection (Direct, DERP, Relay)
- Node stability rankings
- SQLite database with configurable retention
- Docker and Docker Compose support
- RESTful API endpoints
- Health check endpoint
- Background sync scheduler
- Tailscale CLI integration for ping tests
- Dark mode premium UI design
- Node detail page with historical data
- System events tracking

### Features

- [x] Dashboard with KPIs (Total Nodes, Online, Offline, Avg Latency, Direct Ratio)
- [x] Latency trend chart
- [x] Online status trend chart
- [x] Latency distribution visualization
- [x] Stability ranking display
- [x] Node table with filtering
- [x] Device selector for individual node view
- [x] Auto-refresh every 30 seconds
- [x] Manual sync trigger
- [x] Configurable ping intervals
- [x] Data retention settings

## [0.1.0] - 2024-03-01

### Added

- Initial project setup
- Basic Next.js configuration
- Tailwind CSS design system
- Docker configuration
