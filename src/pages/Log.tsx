import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { SectionHeader } from '../components/shared/SectionHeader';
import type { LogEntry } from '../types';

type EntryType = LogEntry['type'];

const TYPE_CONFIG: Record<EntryType, { label: string; color: string; bg: string; border: string }> = {
  action:  { label: 'ACTION',  color: '#00ff88', bg: 'bg-matrix/5',  border: 'border-matrix/30'  },
  message: { label: 'MSG',     color: '#00d4ff', bg: 'bg-cyber/5',   border: 'border-cyber/30'   },
  system:  { label: 'SYS',     color: '#6a8aaa', bg: 'bg-ghost/5',   border: 'border-ghost/30'   },
  warning: { label: 'WARN',    color: '#ff8c00', bg: 'bg-amber/5',   border: 'border-amber/30'   },
  error:   { label: 'ERROR',   color: '#ff3366', bg: 'bg-plasma/5',  border: 'border-plasma/30'  },
};

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('en-GB', { hour12: false });
}
function formatDate(ts: number) {
  const d = new Date(ts);
  return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}`;
}

export function Log() {
  const { log, agents } = useAppStore();
  const [typeFilter, setTypeFilter] = useState<EntryType | 'all'>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = log.filter((e) => {
    if (typeFilter !== 'all' && e.type !== typeFilter) return false;
    if (agentFilter !== 'all' && e.agentId !== agentFilter) return false;
    if (search && !e.content.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-5 h-full flex flex-col overflow-hidden">
      <SectionHeader
        title="Activity Log"
        subtitle={`${log.length} entries — live feed`}
        accent="amber"
      />

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-48 border border-steel rounded px-3 py-1.5 bg-hull">
          <span className="font-mono text-xs text-ghost">SEARCH:</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="filter entries..."
            className="flex-1 bg-transparent font-mono text-xs text-mist placeholder-ghost outline-none"
          />
        </div>

        {/* Type filter */}
        <div className="flex gap-1.5">
          {(['all', 'action', 'message', 'system', 'warning', 'error'] as const).map((t) => {
            const cfg = t !== 'all' ? TYPE_CONFIG[t] : null;
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`font-mono text-[9px] px-2 py-1 rounded border transition-all ${
                  typeFilter === t
                    ? (cfg ? `border-[${cfg.color}]/50 text-[${cfg.color}] bg-[${cfg.color}]/10` : 'border-cyber/50 text-cyber bg-cyber/10')
                    : 'border-ghost/30 text-ghost hover:border-steel'
                }`}
                style={typeFilter === t && cfg ? {
                  borderColor: cfg.color + '80',
                  color: cfg.color,
                  backgroundColor: cfg.color + '18',
                } : undefined}
              >
                {t.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Agent filter */}
        <select
          value={agentFilter}
          onChange={(e) => setAgentFilter(e.target.value)}
          className="font-mono text-[9px] bg-hull border border-steel rounded px-2 py-1 text-mist outline-none"
        >
          <option value="all">ALL AGENTS</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>{a.codename}</option>
          ))}
        </select>
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-y-auto space-y-1 font-mono">
        {filtered.map((entry) => {
          const cfg = TYPE_CONFIG[entry.type];
          return (
            <div
              key={entry.id}
              className={`flex items-start gap-3 p-2 rounded border ${cfg.bg} ${cfg.border} hover:brightness-110 transition-all`}
            >
              {/* Timestamp */}
              <div className="flex-shrink-0 text-[9px] text-ghost w-24">
                <div>{formatTime(entry.timestamp)}</div>
                <div className="text-ghost/50">{formatDate(entry.timestamp)}</div>
              </div>

              {/* Type badge */}
              <div
                className="flex-shrink-0 text-[8px] font-bold px-1.5 py-0.5 rounded w-14 text-center"
                style={{ color: cfg.color, borderColor: cfg.color + '66', border: '1px solid' }}
              >
                {cfg.label}
              </div>

              {/* Agent */}
              <div className="flex-shrink-0 text-[9px] w-24 truncate" style={{ color: cfg.color }}>
                [{entry.agentName}]
              </div>

              {/* Content */}
              <div className="flex-1 text-[10px] text-dim">{entry.content}</div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-ghost text-sm">
            NO LOG ENTRIES MATCHING FILTER
          </div>
        )}
      </div>

      {/* Footer status */}
      <div className="mt-2 pt-2 border-t border-steel/40 flex items-center gap-3 font-mono text-[9px] text-ghost">
        <span className="w-2 h-2 rounded-full bg-matrix animate-pulse" />
        <span>LIVE FEED ACTIVE</span>
        <span className="text-ghost/50">·</span>
        <span>{filtered.length} entries shown</span>
        <span className="text-ghost/50">·</span>
        <span>{log.length} total</span>
      </div>
    </div>
  );
}
