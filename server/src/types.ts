export type AgentStatus = 'working' | 'chatting' | 'idle' | 'offline' | 'error';
export type TaskStatus  = 'queued' | 'running' | 'done' | 'failed' | 'paused';
export type TaskPriority = 'critical' | 'high' | 'normal' | 'low';
export type MissionType  = 'research' | 'code' | 'analyze' | 'write' | 'monitor' | 'infiltrate';

export interface Agent {
  id: string;
  name: string;
  codename: string;
  role: string;
  status: AgentStatus;
  avatar: string;
  color: string;
  position: { x: number; y: number };
  currentTask?: string;
  tasksCompleted: number;
  uptime: number;
  specializations: string[];
  memoryUsed: number;
  cpuLoad: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: MissionType;
  assignedTo?: string;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  progress: number;
  tags: string[];
  output?: string;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  agentId: string;
  agentName: string;
  type: 'action' | 'message' | 'system' | 'warning' | 'error';
  content: string;
}

export interface SystemStats {
  activeAgents: number;
  totalAgents: number;
  runningTasks: number;
  queuedTasks: number;
  completedToday: number;
  systemLoad: number;
  memoryTotal: number;
  memoryUsed: number;
  uptime: number;
}

// WebSocket event types
export type WsEvent =
  | { type: 'agent_update';  payload: Agent }
  | { type: 'task_update';   payload: Task }
  | { type: 'log_entry';     payload: LogEntry }
  | { type: 'stats_update';  payload: SystemStats }
  | { type: 'snapshot';      payload: { agents: Agent[]; tasks: Task[]; log: LogEntry[]; stats: SystemStats } };
