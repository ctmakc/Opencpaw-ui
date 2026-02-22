import { useAppStore } from '../../store/useAppStore';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'COMMAND BRIDGE',  subtitle: 'System overview & mission status' },
  field:     { title: 'THE FIELD',       subtitle: 'Live agent positions & activity' },
  missions:  { title: 'MISSION QUEUE',   subtitle: 'Active & queued operations' },
  agents:    { title: 'AGENT ROSTER',    subtitle: 'OpenClaw agent profiles & status' },
  intel:     { title: 'INTEL VAULT',     subtitle: 'Agent memory & knowledge base' },
  log:       { title: 'ACTIVITY LOG',    subtitle: 'Real-time operations ledger' },
};

function useTime() {
  // Static for SSR compat — in real app use useEffect + setInterval
  const d = new Date();
  return d.toLocaleTimeString('en-GB', { hour12: false });
}

export function TopBar() {
  const { page } = useAppStore();
  const meta  = PAGE_TITLES[page] ?? PAGE_TITLES.dashboard;
  const time  = useTime();
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <header className="h-14 flex-shrink-0 flex items-center justify-between px-5 bg-deck border-b border-steel/60">
      {/* Page title */}
      <div className="flex items-center gap-4">
        <div className="w-px h-6 bg-matrix/40" />
        <div>
          <h1 className="font-mono text-sm font-bold text-mist tracking-widest">{meta.title}</h1>
          <p className="font-mono text-[9px] text-ghost tracking-wide">{meta.subtitle}</p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-5">
        {/* Timestamp */}
        <div className="text-right">
          <div className="font-mono text-xs text-matrix glow-text-matrix">{time}</div>
          <div className="font-mono text-[9px] text-ghost">{today}</div>
        </div>

        {/* Alert indicator */}
        <div className="flex items-center gap-2 px-2.5 py-1 bg-plasma/10 border border-plasma/30 rounded font-mono text-xs text-plasma">
          <span className="w-1.5 h-1.5 rounded-full bg-plasma animate-pulse" />
          1 ALERT
        </div>

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-matrix/10 border border-matrix/30 flex items-center justify-center text-sm">
            🐀
          </div>
          <div>
            <div className="font-mono text-[10px] text-mist">DIGRITZ</div>
            <div className="font-mono text-[8px] text-matrix">COMMANDER</div>
          </div>
        </div>
      </div>
    </header>
  );
}
