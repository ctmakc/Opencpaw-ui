import type { FastifyInstance } from 'fastify';
import { agents } from '../store.js';
import { broadcast } from '../ws/hub.js';
import { addLog } from '../store.js';
import type { AgentStatus } from '../types.js';

export async function agentRoutes(app: FastifyInstance) {
  // GET /api/agents
  app.get('/api/agents', async () => agents);

  // GET /api/agents/:id
  app.get<{ Params: { id: string } }>('/api/agents/:id', async (req, reply) => {
    const agent = agents.find((a) => a.id === req.params.id);
    if (!agent) return reply.status(404).send({ error: 'Agent not found' });
    return agent;
  });

  // PATCH /api/agents/:id  — update status / position / task
  app.patch<{
    Params: { id: string };
    Body: { status?: AgentStatus; currentTask?: string; position?: { x: number; y: number } };
  }>('/api/agents/:id', async (req, reply) => {
    const agent = agents.find((a) => a.id === req.params.id);
    if (!agent) return reply.status(404).send({ error: 'Agent not found' });

    const { status, currentTask, position } = req.body;
    if (status)      agent.status      = status;
    if (currentTask !== undefined) agent.currentTask = currentTask;
    if (position)    agent.position    = position;

    const entry = addLog({
      agentId:   agent.id,
      agentName: agent.codename,
      type:      'system',
      content:   `Manual override: status set to ${agent.status.toUpperCase()}`,
    });
    broadcast({ type: 'agent_update', payload: agent });
    broadcast({ type: 'log_entry',   payload: entry });

    return agent;
  });

  // POST /api/agents/:id/halt
  app.post<{ Params: { id: string } }>('/api/agents/:id/halt', async (req, reply) => {
    const agent = agents.find((a) => a.id === req.params.id);
    if (!agent) return reply.status(404).send({ error: 'Agent not found' });

    agent.status      = 'offline';
    agent.currentTask = undefined;
    agent.cpuLoad     = 0;

    const entry = addLog({
      agentId: agent.id, agentName: agent.codename,
      type: 'warning', content: 'Agent halted by commander override.',
    });
    broadcast({ type: 'agent_update', payload: agent });
    broadcast({ type: 'log_entry',   payload: entry });
    return { ok: true };
  });

  // POST /api/agents/:id/activate
  app.post<{ Params: { id: string } }>('/api/agents/:id/activate', async (req, reply) => {
    const agent = agents.find((a) => a.id === req.params.id);
    if (!agent) return reply.status(404).send({ error: 'Agent not found' });

    agent.status  = 'idle';
    agent.cpuLoad = 10;

    const entry = addLog({
      agentId: agent.id, agentName: agent.codename,
      type: 'system', content: 'Agent activated. Standing by.',
    });
    broadcast({ type: 'agent_update', payload: agent });
    broadcast({ type: 'log_entry',   payload: entry });
    return { ok: true };
  });
}
