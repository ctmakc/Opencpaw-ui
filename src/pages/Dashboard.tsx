import { useAppStore } from '../store/useAppStore';
import { SectionHeader } from '../components/shared/SectionHeader';
import { StatusDot } from '../components/shared/StatusDot';
import type { AgentStatus, TaskStatus, TaskPriority } from '../types';

function formatUptime(seconds: number) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatTimeAgo(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return 'just now';
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  critical: 'text-plasma border-plasma/40 bg-plasma/10',
  high:     'text-amber border-amber/40 bg-amber/10',
  normal:   'text-cyber border-cyber/40 bg-cyber/10',
  low:      'text-dim border-ghost/40 bg-ghost/10',
};

const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  running: 'text-matrix',
  queued:  'text-amber',
  done:    'text-dim',
  failed:  'text-plasma',
  paused:  'text-pulse',
};

export function Dashboard() {
  const { stats, agents, tasks, log, setPage } = useAppStore();

  const activeTasks = tasks.filter((t) => t.status === 'running' || t.status === 'queued');
  const recentLog   = log.slice(0, 6);

  return (
    <div className="p-5 space-y-5 overflow-y-auto h-full">
      {/* System stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="ACTIVE AGENTS"
          value={`${stats.activeAgents}/${stats.totalAgents}`}
          sub="online / total"
          accent="matrix"
          icon="◇"
        />
        <StatCard
          label="RUNNING OPS"
          value={String(stats.runningTasks)}
          sub={`${stats.queuedTasks} queued`}
          accent="cyber"
          icon="◎"
        />
        <StatCard
          label="COMPLETED TODAY"
          value={String(stats.completedToday)}
          sub="missions done"
          accent="amber"
          icon="✓"
        />
        <StatCard
          label="SYSTEM UPTIME"
          value={formatUptime(stats.uptime)}
          sub="continuous ops"
          accent="pulse"
          icon="⬡"
        />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Active agents */}
        <div className="col-span-1 card p-4">
          <SectionHeader title="Agent Status" accent="matrix" />
          <div className="space-y-2">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center gap-2.5 p-2 rounded-md bg-deck hover:bg-plate transition-colors cursor-pointer border border-transparent hover:border-steel/50"
                onClick={() => setPage('agents')}
              >
                <span className="text-lg">{agent.avatar}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs text-mist font-medium truncate">{agent.codename}</div>
                  <div className="font-mono text-[9px] text-dim truncate">{agent.currentTask ?? 'Standby'}</div>
                </div>
                <StatusDot status={agent.status as AgentStatus} />
              </div>
            ))}
          </div>
        </div>

        {/* Active tasks */}
        <div className="col-span-2 card p-4">
          <SectionHeader title="Active Missions" accent="cyber">
            <button
              onClick={() => setPage('missions')}
              className="font-mono text-[10px] text-ghost hover:text-cyber transition-colors border border-ghost/30 hover:border-cyber/40 px-2 py-0.5 rounded"
            >
              VIEW ALL →
            </button>
          </SectionHeader>
          <div className="space-y-2">
            {activeTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="card p-3 hover:border-steel transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-xs text-mist font-medium truncate">{task.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`font-mono text-[9px] uppercase font-bold ${TASK_STATUS_COLORS[task.status]}`}>
                        {task.status}
                      </span>
                      <span className={`font-mono text-[8px] px-1 py-0.5 rounded border ${PRIORITY_COLORS[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-matrix font-bold">{task.progress}%</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-0.5 bg-steel rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${task.progress}%`,
                      backgroundColor: task.status === 'running' ? '#00ff88' : '#ff8c00',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity log strip */}
      <div className="card p-4">
        <SectionHeader title="Recent Activity" accent="amber">
          <button
            onClick={() => setPage('log')}
            className="font-mono text-[10px] text-ghost hover:text-amber transition-colors border border-ghost/30 hover:border-amber/40 px-2 py-0.5 rounded"
          >
            FULL LOG →
          </button>
        </SectionHeader>
        <div className="space-y-1.5">
          {recentLog.map((entry) => (
            <LogLine key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label, value, sub, accent, icon,
}: {
  label: string; value: string; sub: string; accent: string; icon: string;
}) {
  const accentMap: Record<string, { text: string; glow: string; border: string; bg: string }> = {
    matrix: { text: 'text-matrix', glow: 'glow-text-matrix', border: 'border-matrix/20', bg: 'bg-matrix/5'  },
    cyber:  { text: 'text-cyber',  glow: 'glow-text-cyber',  border: 'border-cyber/20',  bg: 'bg-cyber/5'   },
    amber:  { text: 'text-amber',  glow: 'glow-text-amber',  border: 'border-amber/20',  bg: 'bg-amber/5'   },
    pulse:  { text: 'text-pulse',  glow: '',                 border: 'border-pulse/20',  bg: 'bg-pulse/5'   },
  };
  const a = accentMap[accent] ?? accentMap.matrix;
  return (
    <div className={`card p-4 border ${a.border} ${a.bg}`}>
      <div className="flex items-start justify-between mb-2">
        <span className={`font-mono text-lg ${a.text} ${a.glow}`}>{icon}</span>
        <span className={`font-mono text-[9px] uppercase tracking-widest text-dim`}>{label}</span>
      </div>
      <div className={`font-mono text-2xl font-bold ${a.text} ${a.glow}`}>{value}</div>
      <div className="font-mono text-[9px] text-ghost mt-0.5">{sub}</div>
    </div>
  );
}

type LogEntryType = 'action' | 'message' | 'system' | 'warning' | 'error';

function LogLine({ entry }: { entry: { id: string; timestamp: number; agentName: string; type: LogEntryType; content: string } }) {
  const typeColors: Record<LogEntryType, string> = {
    action:  'text-matrix',
    message: 'text-cyber',
    system:  'text-dim',
    warning: 'text-amber',
    error:   'text-plasma',
  };
  return (
    <div className="flex items-start gap-2.5 font-mono text-[10px] py-0.5">
      <span className="text-ghost flex-shrink-0 w-12">{formatTimeAgo(entry.timestamp)}</span>
      <span className="text-pulse flex-shrink-0 w-20 truncate">[{entry.agentName}]</span>
      <span className={`flex-shrink-0 w-14 uppercase ${typeColors[entry.type]}`}>{entry.type}</span>
      <span className="text-dim truncate">{entry.content}</span>
    </div>
  );
}
