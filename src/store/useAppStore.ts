import { create } from 'zustand';
import type { Agent, Task, LogEntry, SystemStats } from '../types';
import { MOCK_AGENTS, MOCK_TASKS, MOCK_LOG, MOCK_STATS } from '../data/mockData';

type Page = 'dashboard' | 'field' | 'missions' | 'agents' | 'intel' | 'log';

interface AppState {
  page: Page;
  agents: Agent[];
  tasks: Task[];
  log: LogEntry[];
  stats: SystemStats;
  selectedAgentId: string | null;
  selectedTaskId: string | null;

  setPage: (page: Page) => void;
  selectAgent: (id: string | null) => void;
  selectTask: (id: string | null) => void;
  updateAgentStatus: (id: string, status: Agent['status']) => void;
  addLogEntry: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  page: 'dashboard',
  agents: MOCK_AGENTS,
  tasks: MOCK_TASKS,
  log: MOCK_LOG,
  stats: MOCK_STATS,
  selectedAgentId: null,
  selectedTaskId: null,

  setPage: (page) => set({ page }),
  selectAgent: (id) => set({ selectedAgentId: id }),
  selectTask: (id) => set({ selectedTaskId: id }),

  updateAgentStatus: (id, status) =>
    set((s) => ({
      agents: s.agents.map((a) => (a.id === id ? { ...a, status } : a)),
    })),

  addLogEntry: (entry) =>
    set((s) => ({
      log: [
        { ...entry, id: `l-${Date.now()}`, timestamp: Date.now() },
        ...s.log,
      ].slice(0, 100),
    })),
}));
