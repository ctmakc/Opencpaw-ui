# 🐀 OpenClaw Mission Control

**Stainless Steel Rat-style control panel for OpenClaw AI agents.**

Dark sci-fi UI — React + TypeScript frontend, Fastify + WebSocket backend, live agent simulator.

---

## Quick Start (dev)

```bash
# 1. Install deps (root + server)
npm install
npm install --prefix server

# 2. Start both frontend & backend together
npm run dev:all
```

- **Frontend (Vite HMR):** http://localhost:5173
- **Backend API + WS:**    http://localhost:3001

> Vite automatically proxies `/api/*` and `/ws` to the backend.

---

## Production Deploy (Docker)

```bash
# Build & run everything in one container
docker compose up --build

# Open: http://localhost:3001
```

The container builds the React app, then serves it as static files from the Fastify server.

---

## Manual Production Run

```bash
# 1. Build frontend
npm run build

# 2. Start server (serves built UI + API + WS)
PORT=3001 npm run start --prefix server
```

---

## Architecture

```
┌─────────────────────────────────────────────┐
│  Browser                                    │
│  React (Vite) + Zustand + Framer Motion     │
│  WebSocket client → live agent/task updates  │
└────────────────────┬────────────────────────┘
                     │ WS + REST
┌────────────────────▼────────────────────────┐
│  Fastify Server (Node.js)                   │
│  ├── REST: /api/agents  /api/tasks  /api/log│
│  ├── WS:   /ws (broadcast hub)              │
│  ├── Static: serves /dist (prod)            │
│  └── Simulator: background agent activity  │
└─────────────────────────────────────────────┘
```

## REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/agents` | All agents |
| GET | `/api/agents/:id` | Single agent |
| PATCH | `/api/agents/:id` | Update agent status/task |
| POST | `/api/agents/:id/halt` | Halt agent |
| POST | `/api/agents/:id/activate` | Activate offline agent |
| GET | `/api/tasks` | All tasks |
| POST | `/api/tasks` | Create new task |
| PATCH | `/api/tasks/:id` | Update task |
| GET | `/api/log` | Activity log |
| GET | `/api/stats` | System stats |
| GET | `/api/health` | Health check |

## WebSocket Events

Server → Client:

| Event | Payload |
|-------|---------|
| `snapshot` | Full state on connect |
| `agent_update` | Single agent changed |
| `task_update` | Single task changed |
| `log_entry` | New log entry |
| `stats_update` | System stats refreshed |

## Pages

| Page | Route (sidebar) | Description |
|------|-----------------|-------------|
| Command Bridge | `dashboard` | Stats, active agents & missions overview |
| The Field | `field` | Live 2D agent map with animated positions |
| Mission Queue | `missions` | All tasks, filterable, with progress |
| Agent Roster | `agents` | Agent profiles, stats, controls |
| Intel Vault | `intel` | Agent memory & accumulated intelligence |
| Activity Log | `log` | Full searchable/filterable event log |
