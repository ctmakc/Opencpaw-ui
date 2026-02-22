import type { FastifyInstance } from 'fastify';
import { log, getStats } from '../store.js';

export async function logRoutes(app: FastifyInstance) {
  // GET /api/log?limit=50&type=error
  app.get<{ Querystring: { limit?: string; type?: string; agentId?: string } }>(
    '/api/log',
    async (req) => {
      const limit   = parseInt(req.query.limit ?? '100', 10);
      const type    = req.query.type;
      const agentId = req.query.agentId;

      let result = [...log];
      if (type)    result = result.filter((e) => e.type    === type);
      if (agentId) result = result.filter((e) => e.agentId === agentId);
      return result.slice(0, limit);
    }
  );

  // GET /api/stats
  app.get('/api/stats', async () => getStats());

  // GET /api/health
  app.get('/api/health', async () => ({
    status: 'ok',
    timestamp: Date.now(),
    version: '1.0.0',
  }));
}
