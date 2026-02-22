import { useAppStore } from '../store/useAppStore';
import { SectionHeader } from '../components/shared/SectionHeader';

const INTEL_NODES = [
  {
    id: 'corp-struct',
    category: 'ORGANIZATION',
    title: 'Special Corps Structure',
    content: 'Hierarchical paramilitary organization. HQ: Zenobia. Key personnel: Inskipp (Director). ~3,400 active agents across 47 sectors.',
    agentId: 'inskipp',
    confidence: 94,
    tags: ['corps', 'org', 'personnel'],
    updated: Date.now() - 86400000,
  },
  {
    id: 'liokukae-layout',
    category: 'FACILITY',
    title: 'Liokukae Prison Colony',
    content: '12-level underground installation. 3 guard shifts. Blind spot: Camera 7G offline (maintenance). Emergency power: 40-second gap on sector switch.',
    agentId: 'angelina',
    confidence: 87,
    tags: ['prison', 'escape', 'tactical'],
    updated: Date.now() - 3600000,
  },
  {
    id: 'morality-board',
    category: 'INTELLIGENCE',
    title: 'Morality Board — Key Members',
    content: 'Chairman: Grav-Senator Tzen Patel. 12 active members. Known corruption vector: Offshore accounts on Castor. Voting pattern: Predictable on criminal reform.',
    agentId: 'bishop',
    confidence: 72,
    tags: ['politics', 'morality-board', 'intel'],
    updated: Date.now() - 7200000,
  },
  {
    id: 'vault7',
    category: 'TECHNICAL',
    title: 'Vault-7 Firmware CVE',
    content: 'Legacy ARM-based controller running firmware v2.1.4. Buffer overflow in auth handler. Exploit requires physical access to COM port. IDS triggers at layer 4.',
    agentId: 'razor',
    confidence: 45,
    tags: ['exploit', 'vault', 'firmware'],
    updated: Date.now() - 21600000,
  },
  {
    id: 'currency-net',
    category: 'FINANCIAL',
    title: 'Bishwanath Exchange Network',
    content: '47 currency laundering nodes mapped across Outer Worlds. Primary hub: Cassylia Station. Daily volume: ~14M credits. Key intermediary: "The Fixer" — identity unknown.',
    agentId: 'inskipp',
    confidence: 91,
    tags: ['finance', 'outer-worlds', 'currency'],
    updated: Date.now() - 86400000 * 2,
  },
  {
    id: 'comms-pattern',
    category: 'SIGINT',
    title: 'Corps Comms Encryption Pattern',
    content: 'Rotating 256-bit keys, 15-min cycle. Predictable seed on Tuesdays (maintenance window). Interception window: 30-second gap during key rotation.',
    agentId: 'meta-llc',
    confidence: 63,
    tags: ['sigint', 'comms', 'encryption'],
    updated: Date.now() - 43200000,
  },
];

const CATEGORY_COLORS: Record<string, { text: string; border: string; bg: string }> = {
  ORGANIZATION: { text: 'text-cyber',   border: 'border-cyber/30',   bg: 'bg-cyber/5'   },
  FACILITY:     { text: 'text-matrix',  border: 'border-matrix/30',  bg: 'bg-matrix/5'  },
  INTELLIGENCE: { text: 'text-pulse',   border: 'border-pulse/30',   bg: 'bg-pulse/5'   },
  TECHNICAL:    { text: 'text-amber',   border: 'border-amber/30',   bg: 'bg-amber/5'   },
  FINANCIAL:    { text: 'text-matrix',  border: 'border-matrix/30',  bg: 'bg-matrix/5'  },
  SIGINT:       { text: 'text-cyber',   border: 'border-cyber/30',   bg: 'bg-cyber/5'   },
};

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 80 ? '#00ff88' : value >= 60 ? '#ff8c00' : '#ff3366';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-steel rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="font-mono text-[9px]" style={{ color }}>{value}%</span>
    </div>
  );
}

function formatRelTime(ts: number) {
  const diff = Date.now() - ts;
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(h / 24);
  return d > 0 ? `${d}d ago` : h > 0 ? `${h}h ago` : 'recent';
}

export function Intel() {
  const { agents } = useAppStore();

  return (
    <div className="p-5 h-full overflow-y-auto">
      <SectionHeader
        title="Intel Vault"
        subtitle="Agent memory & accumulated intelligence"
        accent="pulse"
      />

      {/* Memory overview */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {agents.map((agent) => (
          <div key={agent.id} className="card p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{agent.avatar}</span>
              <div>
                <div className="font-mono text-[10px] font-bold" style={{ color: agent.color }}>
                  {agent.codename}
                </div>
                <div className="font-mono text-[8px] text-ghost">MEMORY BANK</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-mono text-[8px]">
                <span className="text-ghost w-10">USED</span>
                <div className="flex-1 h-0.5 bg-steel rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(agent.memoryUsed / 1024) * 100}%`, backgroundColor: agent.color }} />
                </div>
                <span className="text-dim">{agent.memoryUsed}MB</span>
              </div>
            </div>
            <div className="font-mono text-[8px] text-ghost mt-1">
              {INTEL_NODES.filter(n => n.agentId === agent.id).length} nodes stored
            </div>
          </div>
        ))}
      </div>

      {/* Intel nodes grid */}
      <div className="grid grid-cols-2 gap-3">
        {INTEL_NODES.map((node) => {
          const cfg = CATEGORY_COLORS[node.category] ?? CATEGORY_COLORS.INTELLIGENCE;
          const agent = agents.find(a => a.id === node.agentId);
          return (
            <div key={node.id} className={`card p-4 hover:brightness-110 transition-all cursor-pointer border ${cfg.border} ${cfg.bg}`}>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className={`font-mono text-[8px] uppercase tracking-widest ${cfg.text}`}>
                    {node.category}
                  </span>
                  <h3 className="font-mono text-xs font-bold text-mist mt-0.5">{node.title}</h3>
                </div>
                {agent && (
                  <div className="text-lg flex-shrink-0 opacity-70">{agent.avatar}</div>
                )}
              </div>

              {/* Content */}
              <p className="font-mono text-[10px] text-dim leading-relaxed mb-3">{node.content}</p>

              {/* Confidence */}
              <div className="mb-2">
                <div className="font-mono text-[8px] text-ghost mb-1">CONFIDENCE</div>
                <ConfidenceBar value={node.confidence} />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1 flex-wrap">
                  {node.tags.map((tag) => (
                    <span key={tag} className="font-mono text-[7px] px-1 py-0.5 rounded border border-ghost/30 text-ghost">
                      #{tag}
                    </span>
                  ))}
                </div>
                <span className="font-mono text-[8px] text-ghost flex-shrink-0">
                  {formatRelTime(node.updated)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
