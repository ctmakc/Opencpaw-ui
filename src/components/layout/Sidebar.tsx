import { useAppStore } from '../../store/useAppStore';

type Page = 'dashboard' | 'field' | 'missions' | 'agents' | 'intel' | 'log';

const NAV_ITEMS: Array<{ id: Page; label: string; icon: string; badge?: number }> = [
  { id: 'dashboard', label: 'COMMAND BRIDGE', icon: '⬡' },
  { id: 'field',     label: 'THE FIELD',       icon: '◈' },
  { id: 'missions',  label: 'MISSIONS',         icon: '◎' },
  { id: 'agents',    label: 'AGENTS',           icon: '◇' },
  { id: 'intel',     label: 'INTEL VAULT',      icon: '◆' },
  { id: 'log',       label: 'ACTIVITY LOG',     icon: '≡' },
];

export function Sidebar() {
  const { page, setPage, agents, tasks, stats } = useAppStore();

  const activeAgents = agents.filter((a) => a.status !== 'offline').length;
  const runningTasks = tasks.filter((t) => t.status === 'running').length;
  const errorAgents  = agents.filter((a) => a.status === 'error').length;

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col bg-deck border-r border-steel/60 h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-steel/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-matrix/10 border border-matrix/30 flex items-center justify-center text-lg">
            🐀
          </div>
          <div>
            <div className="font-mono text-xs font-bold text-matrix glow-text-matrix tracking-widest">
              OPENCLAW
            </div>
            <div className="font-mono text-[9px] text-ghost tracking-widest">
              MISSION CONTROL
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="px-3 py-3 border-b border-steel/40 grid grid-cols-3 gap-1.5">
        <StatPill label="AGENTS" value={activeAgents} color="matrix" />
        <StatPill label="OPS"    value={runningTasks} color="cyber"  />
        <StatPill label="ALERTS" value={errorAgents}  color={errorAgents > 0 ? 'plasma' : 'ghost'} />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`nav-item w-full text-left ${page === item.id ? 'active' : ''}`}
          >
            <span className="text-base w-5 text-center font-mono">{item.icon}</span>
            <span className="flex-1 font-mono text-[11px] tracking-wider">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* System status footer */}
      <div className="px-3 py-3 border-t border-steel/40">
        <div className="font-mono text-[9px] text-ghost space-y-1">
          <div className="flex justify-between">
            <span>SYS LOAD</span>
            <span className="text-amber">{stats.systemLoad}%</span>
          </div>
          <div className="w-full h-0.5 bg-steel rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-amber transition-all"
              style={{ width: `${stats.systemLoad}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span>MEM</span>
            <span className="text-cyber">{Math.round(stats.memoryUsed / 1024 * 10) / 10}GB / {stats.memoryTotal / 1024}GB</span>
          </div>
          <div className="w-full h-0.5 bg-steel rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-cyber transition-all"
              style={{ width: `${(stats.memoryUsed / stats.memoryTotal) * 100}%` }}
            />
          </div>
          <div className="flex items-center gap-1.5 mt-2 pt-1 border-t border-steel/30">
            <span className="w-1.5 h-1.5 rounded-full bg-matrix animate-pulse" />
            <span className="text-matrix">SYSTEM ONLINE</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    matrix: 'text-matrix',
    cyber:  'text-cyber',
    amber:  'text-amber',
    plasma: 'text-plasma',
    ghost:  'text-dim',
  };
  return (
    <div className="bg-hull rounded p-1.5 text-center border border-steel/50">
      <div className={`font-mono text-sm font-bold ${colorMap[color] ?? 'text-dim'}`}>{value}</div>
      <div className="font-mono text-[8px] text-ghost">{label}</div>
    </div>
  );
}
