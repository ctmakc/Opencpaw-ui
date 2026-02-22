import Fastify from 'fastify';
import cors from '@fastify/cors';
import staticFiles from '@fastify/static';
import websocket from '@fastify/websocket';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { existsSync } from 'fs';

import { agentRoutes } from './routes/agents.js';
import { taskRoutes }  from './routes/tasks.js';
import { logRoutes }   from './routes/log.js';
import { addClient }   from './ws/hub.js';
import { startSimulator } from './sim/simulator.js';
import { agents, tasks, log, getStats } from './store.js';
import type { WsEvent } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PORT = parseInt(process.env.PORT ?? '3001', 10);
const HOST = process.env.HOST ?? '0.0.0.0';

const app = Fastify({ logger: { level: 'info' } });

// CORS — allow all origins in dev
await app.register(cors, { origin: true });

// WebSocket support
await app.register(websocket);

// Serve built frontend static files if dist/ exists
const distPath = join(__dirname, '../../dist');
if (existsSync(distPath)) {
  await app.register(staticFiles, {
    root:      distPath,
    prefix:    '/',
    decorateReply: false,
  });
  // SPA fallback
  app.setNotFoundHandler(async (_req, reply) => {
    return reply.sendFile('index.html');
  });
}

// REST routes
await app.register(agentRoutes);
await app.register(taskRoutes);
await app.register(logRoutes);

// WebSocket endpoint
app.get('/ws', { websocket: true }, (socket) => {
  console.log('[WS] Client connected');
  addClient(socket as unknown as import('ws').WebSocket);

  // Send full snapshot on connect
  const snapshot: WsEvent = {
    type: 'snapshot',
    payload: {
      agents,
      tasks,
      log: log.slice(0, 50),
      stats: getStats(),
    },
  };
  socket.send(JSON.stringify(snapshot));
});

// Start server
try {
  await app.listen({ port: PORT, host: HOST });
  console.log(`\n🐀 OpenClaw Server running at http://localhost:${PORT}`);
  console.log(`   WS endpoint: ws://localhost:${PORT}/ws`);
  console.log(`   REST API:    http://localhost:${PORT}/api/*\n`);

  startSimulator();
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
