import { agents, tasks, addLog, completedToday, getStats } from '../store.js';
import { broadcast } from '../ws/hub.js';
import type { AgentStatus, Task } from '../types.js';

let _completedToday = completedToday;

const rnd = (min: number, max: number) => Math.random() * (max - min) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// --- Agent Status transitions ---
const STATUS_TRANSITIONS: Record<AgentStatus, AgentStatus[]> = {
  working:  ['working', 'working', 'working', 'chatting', 'idle'],
  chatting: ['chatting', 'working', 'working'],
  idle:     ['idle', 'working', 'chatting', 'idle'],
  offline:  ['offline'],
  error:    ['error', 'error', 'idle'],   // error can clear itself occasionally
};

const WORK_PHRASES: Record<string, string[]> = {
  'slippery-jim': [
    'Bypassed firewall segment 7. Scanning inner network.',
    'Social engineering target acquired. Initiating contact.',
    'Security rotation mapped. Window: 90 seconds.',
    'Cover identity holding. Proceeding deeper.',
    'Decoy file planted. Triggering diversion now.',
  ],
  'angelina': [
    'Tactical perimeter assessed. 3 entry vectors viable.',
    'Guard patrol pattern logged. Shift change in 12min.',
    'Escape route Gamma confirmed. Fallback ready.',
    'Coordinating with Slippery Jim on extraction timing.',
    'Weapons cache located in sector 4. Noted for retrieval.',
  ],
  'inskipp': [
    'Mission parameters reviewed. Proceed as planned.',
    'Cross-referencing agent reports. Anomaly detected.',
    'Corps intelligence update received. Briefing agents.',
    'Strategic reserve activated. Standing by.',
    'Authorization granted for Phase 2 operations.',
  ],
  'meta-llc': [
    'Signal intercept locked. Decoding in progress.',
    'Passive scan sweep complete. No anomalies.',
    'Encrypted burst detected on channel 7. Analyzing.',
    'Reconnaissance pass complete. Zone clear.',
    'Shadow protocol engaged. Going dark.',
  ],
  'bishop': [
    'Database cross-reference yielded 847 new connections.',
    'Historical pattern analysis complete. Report generated.',
    'Archive scan: 3 relevant documents flagged.',
    'Linguistic analysis of comm logs finalized.',
    'Knowledge synthesis complete. Uploading to Intel Vault.',
  ],
  'razor': [
    'Exploit payload compiled. Testing in sandbox.',
    'CVE analysis complete. 2 viable attack vectors found.',
    'Kernel-level access achieved on test environment.',
    'Obfuscation layer deployed. Signature masked.',
    'Penetration test phase 1 complete.',
  ],
};

const CHAT_PHRASES = [
  'Standing by for next orders.',
  'Syncing status with team.',
  'Mission debrief in progress.',
  'Reviewing tactical options with ANGEL.',
  'Coordinating resource allocation.',
];

// Nudge agent positions slightly over time
function driftPosition(agentId: string) {
  const agent = agents.find((a) => a.id === agentId);
  if (!agent || agent.status === 'offline') return;
  agent.position = {
    x: Math.max(5, Math.min(90, agent.position.x + rnd(-4, 4))),
    y: Math.max(5, Math.min(90, agent.position.y + rnd(-4, 4))),
  };
}

// Fluctuate CPU load
function fluctuateCpu(agentId: string) {
  const agent = agents.find((a) => a.id === agentId);
  if (!agent) return;
  const target = agent.status === 'working' ? rnd(40, 95) : agent.status === 'idle' ? rnd(5, 20) : rnd(20, 60);
  agent.cpuLoad = Math.round(agent.cpuLoad * 0.7 + target * 0.3);
  agent.memoryUsed = Math.max(128, Math.min(900, agent.memoryUsed + rnd(-20, 20)));
}

// Advance running task progress
function advanceTasks() {
  const running = tasks.filter((t) => t.status === 'running');
  for (const task of running) {
    const delta = rnd(1, 6);
    task.progress = Math.min(100, task.progress + delta);

    if (task.progress >= 100) {
      task.status = 'done';
      task.completedAt = Date.now();
      task.progress = 100;
      _completedToday++;

      const agent = agents.find((a) => a.id === task.assignedTo);
      if (agent) {
        agent.tasksCompleted++;
        agent.currentTask = undefined;
        agent.status = 'idle';
      }

      const entry = addLog({
        agentId:   task.assignedTo ?? 'system',
        agentName: agent?.codename ?? 'SYSTEM',
        type: 'system',
        content: `Mission COMPLETE: "${task.title}"`,
      });
      broadcast({ type: 'log_entry', payload: entry });
      broadcast({ type: 'task_update', payload: task });

      // Try to assign a queued task
      const queued = tasks.find((t) => t.status === 'queued');
      if (queued && agent) {
        queued.status = 'running';
        queued.startedAt = Date.now();
        queued.assignedTo = agent.id;
        agent.currentTask = queued.title;
        agent.status = 'working';
        const e2 = addLog({
          agentId: agent.id,
          agentName: agent.codename,
          type: 'system',
          content: `New mission assigned: "${queued.title}"`,
        });
        broadcast({ type: 'log_entry', payload: e2 });
        broadcast({ type: 'task_update', payload: queued });
        broadcast({ type: 'agent_update', payload: agent });
      }
    } else {
      broadcast({ type: 'task_update', payload: task });
    }
  }
}

// Randomly update an agent's status + emit a log entry
function tickAgent() {
  const agent = pick(agents.filter((a) => a.status !== 'offline'));
  if (!agent) return;

  const prevStatus = agent.status;
  const nextStatuses = STATUS_TRANSITIONS[prevStatus];
  agent.status = pick(nextStatuses);

  driftPosition(agent.id);
  fluctuateCpu(agent.id);

  // Emit a narrative log line based on new status
  let content: string;
  let logType: 'action' | 'message' | 'warning' | 'error' | 'system' = 'action';

  if (agent.status === 'working') {
    content = pick(WORK_PHRASES[agent.id] ?? WORK_PHRASES['bishop']);
    logType = 'action';
  } else if (agent.status === 'chatting') {
    content = pick(CHAT_PHRASES);
    logType = 'message';
  } else if (agent.status === 'error' && prevStatus !== 'error') {
    content = `EXCEPTION: Unexpected error in active process. Attempting recovery.`;
    logType = 'error';
  } else {
    content = `Status updated: ${agent.status.toUpperCase()}`;
    logType = 'system';
  }

  const entry = addLog({ agentId: agent.id, agentName: agent.codename, type: logType, content });

  broadcast({ type: 'agent_update', payload: agent });
  broadcast({ type: 'log_entry',   payload: entry });
}

export function startSimulator() {
  console.log('[SIM] Simulator started');

  // Agent tick every 4–8 seconds
  const agentTick = () => {
    tickAgent();
    setTimeout(agentTick, rnd(4000, 8000));
  };
  setTimeout(agentTick, 2000);

  // Task progress tick every 5 seconds
  setInterval(() => {
    advanceTasks();
    broadcast({ type: 'stats_update', payload: getStats() });
  }, 5000);

  // Uptime increment tick every 30 seconds
  setInterval(() => {
    for (const a of agents) {
      if (a.status !== 'offline') a.uptime += 30;
    }
  }, 30000);
}
