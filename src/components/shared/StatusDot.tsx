import type { AgentStatus } from '../../types';

const STATUS_CONFIG: Record<AgentStatus, { color: string; label: string; pulse: boolean }> = {
  working:  { color: '#00ff88', label: 'WORKING',  pulse: true  },
  chatting: { color: '#00d4ff', label: 'CHATTING', pulse: true  },
  idle:     { color: '#ff8c00', label: 'IDLE',     pulse: false },
  offline:  { color: '#3a5570', label: 'OFFLINE',  pulse: false },
  error:    { color: '#ff3366', label: 'ERROR',    pulse: true  },
};

interface StatusDotProps {
  status: AgentStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function StatusDot({ status, showLabel = false, size = 'md' }: StatusDotProps) {
  const cfg = STATUS_CONFIG[status];
  const sz = size === 'sm' ? 6 : 8;

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative flex" style={{ width: sz, height: sz }}>
        {cfg.pulse && (
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
            style={{ backgroundColor: cfg.color }}
          />
        )}
        <span
          className="relative inline-flex rounded-full"
          style={{ width: sz, height: sz, backgroundColor: cfg.color }}
        />
      </span>
      {showLabel && (
        <span className="font-mono text-xs" style={{ color: cfg.color }}>
          {cfg.label}
        </span>
      )}
    </span>
  );
}

export function StatusBadge({ status }: { status: AgentStatus }) {
  const cfg = STATUS_CONFIG[status];
  const cls: Record<AgentStatus, string> = {
    working:  'badge-working',
    chatting: 'badge-chatting',
    idle:     'badge-idle',
    offline:  'badge-offline',
    error:    'badge-error',
  };
  return (
    <span className={cls[status]}>
      <StatusDot status={status} size="sm" />
      {cfg.label}
    </span>
  );
}
