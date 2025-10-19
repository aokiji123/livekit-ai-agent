# Buddy Agent

Voice agent application with LiveKit - Next.js frontend + Python voice agent.

## Quick Start

```bash
# 1. Configure environment (first time only)
cp .env.example .env
# Edit .env with your LiveKit credentials

# 2. Start everything
docker compose up
```

Access at: http://localhost:3000

## Health Checks

- Frontend: http://localhost:3000/api/healthz
- Voice Agent: http://localhost:8080/healthz