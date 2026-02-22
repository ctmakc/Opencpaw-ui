import { create } from 'zustand';
import type { Agent, Task, LogEntry, SystemStats } from '../types';
import { MOCK_AGENTS, MOCK_TASKS, MOCK_LOG, MOCK_STATS } from '../data/mockData';

type Page = 'dashboard' | 'field' | 'missions' | 'agents' | 'intel' | 'log';

interface Snapshot {
  agents: Agent[];
  tasks:  Task[];
  log:    LogEntry[];
  stats:  SystemStats;
}

interface AppState {
  page:             Page;
  agents:           Agent[];
  tasks:            Task[];
  log:              LogEntry[];
  stats:            SystemStats;
  selectedAgentId:  string | null;
  selectedTaskId:   string | null;
  wsConnected:      boolean;

  setPage:           (page: Page) => void;
  selectAgent:       (id: string | null) => void;
  selectTask:        (id: string | null) => void;

  setWsConnected:    (v: boolean) => void;
  applySnapshot:     (snap: Snapshot) => void;
  applyAgentUpdate:  (agent: Agent) => void;
  applyTaskUpdate:   (task: Task) => void;
  applyLogEntry:     (entry: LogEntry) => void;
  applyStatsUpdate:  (stats: SystemStats) => void;
}

export const useAppStore = create<AppState>((set) => ({
  page:            'dashboard',
  agents:          MOCK_AGENTS,
  tasks:           MOCK_TASKS,
  log:             MOCK_LOG,
  stats:           MOCK_STATS,
  selectedAgentId: null,
  selectedTaskId:  null,
  wsConnected:     false,

  setPage:     (page) => set({ page }),
  selectAgent: (id)   => set({ selectedAgentId: id }),
  selectTask:  (id)   => set({ selectedTaskId: id }),

  setWsConnected: (v) => set({ wsConnected: v }),

  applySnapshot: (snap) =>
    set({ agents: snap.agents, tasks: snap.tasks, log: snap.log, stats: snap.stats }),

  applyAgentUpdate: (agent) =>
    set((s) => ({
      agents: s.agents.map((a) => (a.id === agent.id ? { ...a, ...agent } : a)),
    })),

  applyTaskUpdate: (task) =>
    set((s) => {
      const exists = s.tasks.some((t) => t.id === task.id);
      return {
        tasks: exists
          ? s.tasks.map((t) => (t.id === task.id ? { ...t, ...task } : t))
          : [task, ...s.tasks],
      };
    }),

  applyLogEntry: (entry) =>
    set((s) => ({ log: [entry, ...s.log].slice(0, 200) })),

  applyStatsUpdate: (stats) => set({ stats }),
}));
