# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within Tailscale Status, please report it responsibly.

### How to Report

1. **Do NOT** open a public GitHub issue for security vulnerabilities
2. Send an email to the maintainers or use GitHub's private vulnerability reporting
3. Include the following information:
   - Type of vulnerability
   - Full paths of source file(s) related to the vulnerability
   - Location of the affected source code
   - Step-by-step instructions to reproduce
   - Proof-of-concept or exploit code (if possible)
   - Impact assessment

### Response Timeline

- We aim to acknowledge reports within 48 hours
- We will provide a more detailed response within 7 days
- We will work with you to understand and fix the vulnerability
- We will publicly disclose the vulnerability after a fix is released

## Security Best Practices

When deploying Tailscale Status:

1. **API Keys**: Never commit API keys to version control. Use environment variables.
2. **Database**: Ensure the SQLite database is stored in a secure location
3. **Network**: Use appropriate firewall rules to restrict access
4. **Updates**: Keep the application updated to the latest version
5. **Credentials**: Rotate Tailscale API keys periodically

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `TAILSCALE_API_KEY` | Tailscale API key | Yes |
| `TAILSCALE_TAILNET` | Your tailnet name | Yes |
| `DATABASE_PATH` | Path to SQLite database | No |
| `NODE_SYNC_INTERVAL_SEC` | Node sync interval (seconds) | No |
| `PING_POLLING_INTERVAL_SEC` | Ping interval (seconds) | No |
