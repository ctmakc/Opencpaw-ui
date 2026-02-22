import type { FastifyInstance } from 'fastify';
import { tasks, agents, addLog } from '../store.js';
import { broadcast } from '../ws/hub.js';
import type { Task, TaskStatus, TaskPriority, MissionType } from '../types.js';

export async function taskRoutes(app: FastifyInstance) {
  // GET /api/tasks
  app.get('/api/tasks', async () => tasks);

  // GET /api/tasks/:id
  app.get<{ Params: { id: string } }>('/api/tasks/:id', async (req, reply) => {
    const task = tasks.find((t) => t.id === req.params.id);
    if (!task) return reply.status(404).send({ error: 'Task not found' });
    return task;
  });

  // POST /api/tasks — create new task
  app.post<{
    Body: {
      title: string;
      description: string;
      priority: TaskPriority;
      type: MissionType;
      tags?: string[];
      assignedTo?: string;
    };
  }>('/api/tasks', async (req) => {
    const { title, description, priority, type, tags = [], assignedTo } = req.body;
    const newTask: Task = {
      id:          `t-${Date.now()}`,
      title,
      description,
      status:      assignedTo ? 'running' : 'queued',
      priority,
      type,
      tags,
      assignedTo,
      createdAt:   Date.now(),
      startedAt:   assignedTo ? Date.now() : undefined,
      progress:    0,
    };
    tasks.unshift(newTask);

    if (assignedTo) {
      const agent = agents.find((a) => a.id === assignedTo);
      if (agent) {
        agent.currentTask = title;
        agent.status      = 'working';
        broadcast({ type: 'agent_update', payload: agent });
      }
    }

    const entry = addLog({
      agentId:   assignedTo ?? 'system',
      agentName: agents.find((a) => a.id === assignedTo)?.codename ?? 'SYSTEM',
      type:      'system',
      content:   `New mission created: "${title}" — priority: ${priority.toUpperCase()}`,
    });
    broadcast({ type: 'task_update',  payload: newTask });
    broadcast({ type: 'log_entry',    payload: entry });
    return newTask;
  });

  // PATCH /api/tasks/:id — update status / progress
  app.patch<{
    Params: { id: string };
    Body: { status?: TaskStatus; progress?: number; output?: string; assignedTo?: string };
  }>('/api/tasks/:id', async (req, reply) => {
    const task = tasks.find((t) => t.id === req.params.id);
    if (!task) return reply.status(404).send({ error: 'Task not found' });

    const { status, progress, output, assignedTo } = req.body;
    if (status   !== undefined) task.status   = status;
    if (progress !== undefined) task.progress = progress;
    if (output   !== undefined) task.output   = output;
    if (assignedTo)             task.assignedTo = assignedTo;

    if (status === 'done' || status === 'failed') {
      task.completedAt = Date.now();
    }

    const entry = addLog({
      agentId:   task.assignedTo ?? 'system',
      agentName: agents.find((a) => a.id === task.assignedTo)?.codename ?? 'SYSTEM',
      type:      'system',
      content:   `Mission "${task.title}" status → ${task.status.toUpperCase()}`,
    });
    broadcast({ type: 'task_update', payload: task });
    broadcast({ type: 'log_entry',  payload: entry });
    return task;
  });
}
