# Buddy Agent

A voice AI assistant you can actually talk to. Built this to explore real-time voice interactions with LiveKit—it lets you have natural conversations with an AI agent, customize its personality with prompts, and review past chats.

## What's Inside

The frontend is Next.js 15 with React 19, using TanStack Query for data fetching and Zustand for state. The backend is a Python voice agent powered by LiveKit Agents, OpenAI's GPT-4.1-mini for the brain, and Cartesia TTS for surprisingly natural-sounding speech.

Everything runs in Docker with hot-reload, so you can tweak code and see changes instantly. Data lives in memory (Zustand stores) which is great for development but obviously won't survive restarts—more on that trade-off later.

---

## Getting Started

The easiest way to run this is with Docker Compose. First, create a `.env` file with your LiveKit, OpenAI, AssemblyAI and Cartesia credentials:

```bash
cp .env.example .env
```

Then start everything:

```bash
docker compose up
```

Open http://localhost:3000 and you're good to go. Both services will auto-reload when you edit code, which is super handy for development.

If you'd rather run things manually without Docker:

```bash
# Frontend
cd agent-starter-react
npm install
npm run dev

# Voice Agent (in another terminal)
cd livekit-voice-agent
uv sync
uv run agent.py dev
```

---

## Using the App

Once you're up and running:

1. Hit "Dev Login" to get in (no real auth in dev mode)
2. Open the sidebar and go to "Prompts" to create custom instructions for your agent
3. Press `Cmd+K` (or `Ctrl+K` on Windows) to quickly select a prompt
4. Click "Start call" and allow mic/camera access
5. Start talking! Or type if you prefer. The agent responds in real-time.
6. Check "History" in the sidebar to review past conversations

**Pro tip:** Hit `Cmd+K` anytime to switch prompts on the fly, or just type `/prompts` or `/history` to navigate around.

---

## Design Decisions & Trade-offs

### Why In-Memory Storage?

I went with Zustand for storing prompts and session history because it's dead simple and lets you iterate fast. No database setup, no migrations, just pure JavaScript objects in memory. 

The obvious downside? Restart the server and everything's gone. This is totally fine for a demo or local development, but you'd definitely want to swap in PostgreSQL or Redis for production. The good news is the API is already structured like a REST API, so that migration should be pretty straightforward.

### Why Not WebSockets for Everything?

For CRUD operations (creating prompts, fetching history), I stuck with plain HTTP endpoints. They're simple, work great with TanStack Query's caching, and honestly... you don't need real-time updates for this stuff. If you edit a prompt, a quick refetch is fine.

Where low latency *does* matter—the actual voice/video data—LiveKit uses WebRTC, which is exactly what you want for real-time media.

### Session History That Just Works

The app automatically captures your conversation transcripts, duration, and which prompt you used. There's a `SessionHistoryTracker` component that watches the LiveKit room state and saves everything when you disconnect. 

It keeps your 10 most recent sessions (configurable in `session-history-store.ts`). This has been super useful for debugging and understanding how conversations flow.

### Keeping Connections Alive

Network hiccups happen. There's a custom `useConnectionResilience` hook that detects connection issues and handles reconnection. The auth state also uses optimistic updates so the UI feels snappy. And health checks make sure both services are actually ready before trying to connect.

---

## If I Had More Time...

Here's what I'd tackle next:

**1. Persistent Storage** – Move to PostgreSQL with Prisma. Add proper prompt versioning so you can see diffs between versions and roll back if needed.

**2. Prompt Templates** – Pre-built templates for common scenarios (customer support agent, language tutor, mock interviewer). One-click setup would make it easier for people to get started.

**3. Actual Auth** – Replace the dev login with real OAuth (GitHub, Google). Add role-based access so teams could use this together.

---

## Running Tests

**Frontend tests:**
```bash
cd agent-starter-react
npm test                # Run all tests
npm test -- --watch     # Watch mode for development
npm test -- --coverage  # See what's covered
```

Coverage reports show up in `agent-starter-react/coverage/lcov-report/index.html` if you want to dig into details.

**Voice agent tests:**
```bash
cd livekit-voice-agent
uv run pytest test_agent.py -v
```

**Health checks** (make sure everything's running):
```bash
curl http://localhost:3000/api/healthz  # Frontend
curl http://localhost:8080/healthz      # Voice agent
```

---

## Tech Stack

**Frontend:** Next.js 15 • React 19 • TypeScript • TanStack Query • Zustand • Tailwind • Radix UI  
**Backend:** Python 3.11+ • LiveKit Agents • OpenAI GPT-4.1-mini • Cartesia TTS • AssemblyAI STT  
**Dev Tools:** Docker • Jest • Pytest • ESLint • Prettier