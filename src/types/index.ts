export type AgentStatus = 'working' | 'chatting' | 'idle' | 'offline' | 'error';
export type TaskStatus  = 'queued' | 'running' | 'done' | 'failed' | 'paused';
export type TaskPriority = 'critical' | 'high' | 'normal' | 'low';
export type MissionType = 'research' | 'code' | 'analyze' | 'write' | 'monitor' | 'infiltrate';

export interface Agent {
  id: string;
  name: string;
  codename: string;
  role: string;
  status: AgentStatus;
  avatar: string;          // emoji or icon key
  color: string;           // accent color hex
  position: { x: number; y: number };
  currentTask?: string;
  tasksCompleted: number;
  uptime: number;          // seconds
  specializations: string[];
  memoryUsed: number;      // MB
  cpuLoad: number;         // 0-100
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: MissionType;
  assignedTo?: string;     // agent id
  createdAt: number;       // timestamp
  startedAt?: number;
  completedAt?: number;
  progress: number;        // 0-100
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
