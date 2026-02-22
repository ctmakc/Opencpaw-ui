import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { SectionHeader } from '../components/shared/SectionHeader';
import { StatusBadge } from '../components/shared/StatusDot';
import type { Agent, AgentStatus } from '../types';

// Office room definitions (as % of container)
const ROOMS = [
  { id: 'ops',     label: 'OPS CENTER',    x: 5,  y: 5,  w: 40, h: 35, color: 'rgba(0,255,136,0.04)' },
  { id: 'intel',   label: 'INTEL ROOM',    x: 52, y: 5,  w: 43, h: 35, color: 'rgba(0,212,255,0.04)' },
  { id: 'comms',   label: 'COMMS HUB',     x: 5,  y: 47, w: 25, h: 48, color: 'rgba(136,136,255,0.04)' },
  { id: 'storage', label: 'DATA VAULT',    x: 37, y: 47, w: 26, h: 48, color: 'rgba(255,140,0,0.04)'  },
  { id: 'escape',  label: 'ESCAPE PODS',   x: 70, y: 47, w: 25, h: 48, color: 'rgba(255,51,102,0.04)' },
];

const STATUS_GLOW: Record<AgentStatus, string> = {
  working:  '0 0 12px #00ff88, 0 0 24px #00ff8844',
  chatting: '0 0 12px #00d4ff, 0 0 24px #00d4ff44',
  idle:     '0 0 8px #ff8c0066',
  offline:  'none',
  error:    '0 0 12px #ff3366, 0 0 24px #ff336644',
};

function AgentNode({
  agent,
  selected,
  onClick,
}: {
  agent: Agent;
  selected: boolean;
  onClick: () => void;
}) {
  const [pos, setPos] = useState(agent.position);

  // Animate agent movement (working agents drift slightly)
  useEffect(() => {
    if (agent.status !== 'working' && agent.status !== 'chatting') return;
    const interval = setInterval(() => {
      setPos((prev) => ({
        x: Math.max(3, Math.min(92, prev.x + (Math.random() - 0.5) * 3)),
        y: Math.max(3, Math.min(92, prev.y + (Math.random() - 0.5) * 3)),
      }));
    }, 2000 + Math.random() * 1000);
    return () => clearInterval(interval);
  }, [agent.status]);

  return (
    <motion.div
      animate={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      transition={{ duration: 1.8, ease: 'easeInOut' }}
      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
      onClick={onClick}
    >
      {/* Selection ring */}
      {selected && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-cyber"
          style={{ margin: -6 }}
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* Agent dot */}
      <motion.div
        className="relative flex items-center justify-center"
        animate={agent.status === 'working' ? { y: [0, -2, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Glow ring for active */}
        {(agent.status === 'working' || agent.status === 'chatting') && (
          <motion.div
            className="absolute w-10 h-10 rounded-full opacity-30"
            style={{ backgroundColor: agent.color }}
            animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-base relative z-10 border-2 bg-hull"
          style={{
            borderColor: agent.color,
            boxShadow: STATUS_GLOW[agent.status],
          }}
        >
          {agent.avatar}
        </div>
      </motion.div>

      {/* Name tag */}
      <div
        className="absolute top-9 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded font-mono text-[8px] font-bold bg-hull border"
        style={{ borderColor: agent.color + '66', color: agent.color }}
      >
        {agent.codename}
      </div>
    </motion.div>
  );
}

export function Field() {
  const { agents, log, selectAgent, selectedAgentId } = useAppStore();
  const [controlCmd, setControlCmd] = useState('');

  const selectedAgent = agents.find((a) => a.id === selectedAgentId);
  const recentLog = log.slice(0, 8);

  const DEMO_COMMANDS = [
    { label: 'ALL WORKING',   action: () => setControlCmd('BROADCAST: Activate all units') },
    { label: 'GATHER',        action: () => setControlCmd('BROADCAST: Converge on OPS CENTER') },
    { label: 'RUN DEBRIEF',   action: () => setControlCmd('BROADCAST: Initiating mission debrief') },
    { label: 'STANDBY',       action: () => setControlCmd('BROADCAST: All units standby mode') },
  ];

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main field */}
      <div className="flex-1 flex flex-col p-5 overflow-hidden">
        <SectionHeader
          title="The Field"
          subtitle="Live agent positions — OpenClaw Operations Base Alpha"
          accent="cyber"
        />

        {/* Field map */}
        <div className="flex-1 relative card border-cyber/20 overflow-hidden grid-bg min-h-0">
          {/* Scanlines overlay */}
          <div
            className="absolute inset-0 z-0 pointer-events-none opacity-30"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px)',
            }}
          />

          {/* Corner decorators */}
          <div className="absolute top-2 left-2 font-mono text-[8px] text-cyber/40">OPS BASE ALPHA — SECTOR 7G</div>
          <div className="absolute top-2 right-2 font-mono text-[8px] text-cyber/40">LIVE FEED ◈</div>
          <div className="absolute bottom-2 left-2 font-mono text-[8px] text-ghost/40">
            AGENTS: {agents.filter(a => a.status !== 'offline').length} ACTIVE
          </div>

          {/* Room zones */}
          {ROOMS.map((room) => (
            <div
              key={room.id}
              className="absolute border border-cyber/10 rounded flex items-end p-1.5"
              style={{
                left: `${room.x}%`,
                top: `${room.y}%`,
                width: `${room.w}%`,
                height: `${room.h}%`,
                backgroundColor: room.color,
              }}
            >
              <span className="font-mono text-[7px] text-cyber/30 uppercase tracking-widest">
                {room.label}
              </span>
            </div>
          ))}

          {/* Agents */}
          {agents.map((agent) => (
            <AgentNode
              key={agent.id}
              agent={agent}
              selected={selectedAgentId === agent.id}
              onClick={() => selectAgent(selectedAgentId === agent.id ? null : agent.id)}
            />
          ))}
        </div>

        {/* Demo controls */}
        <div className="mt-3 flex items-center gap-3">
          <span className="font-mono text-[10px] text-ghost">BROADCAST CMD:</span>
          <div className="flex gap-2">
            {DEMO_COMMANDS.map((cmd) => (
              <button
                key={cmd.label}
                onClick={cmd.action}
                className="font-mono text-[10px] px-3 py-1.5 rounded border border-cyber/30 text-cyber hover:bg-cyber/10 transition-colors"
              >
                {cmd.label}
              </button>
            ))}
          </div>
          {controlCmd && (
            <div className="font-mono text-[10px] text-matrix ml-2 animate-pulse">{controlCmd}</div>
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="w-72 flex-shrink-0 border-l border-steel/60 flex flex-col bg-deck">
        {/* Status legend */}
        <div className="p-4 border-b border-steel/40">
          <div className="font-mono text-[9px] text-ghost uppercase tracking-widest mb-2">Legend</div>
          <div className="space-y-1.5">
            {(['working', 'chatting', 'idle', 'offline', 'error'] as AgentStatus[]).map((s) => (
              <div key={s} className="flex items-center gap-2">
                <StatusBadge status={s} />
              </div>
            ))}
          </div>
        </div>

        {/* Selected agent detail */}
        <AnimatePresence>
          {selectedAgent && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-4 border-b border-steel/40"
            >
              <div className="font-mono text-[9px] text-ghost uppercase tracking-widest mb-2">Selected Agent</div>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xl border-2 bg-hull"
                  style={{ borderColor: selectedAgent.color }}
                >
                  {selectedAgent.avatar}
                </div>
                <div>
                  <div className="font-mono text-xs font-bold" style={{ color: selectedAgent.color }}>
                    {selectedAgent.codename}
                  </div>
                  <div className="font-mono text-[9px] text-dim">{selectedAgent.role}</div>
                </div>
              </div>
              <StatusBadge status={selectedAgent.status} />
              {selectedAgent.currentTask && (
                <div className="mt-2 font-mono text-[9px] text-dim">{selectedAgent.currentTask}</div>
              )}
              <div className="mt-3 space-y-1">
                <MiniBar label="CPU" value={selectedAgent.cpuLoad} color={selectedAgent.color} />
                <MiniBar label="MEM" value={(selectedAgent.memoryUsed / 1024) * 100} color={selectedAgent.color} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live feed */}
        <div className="flex-1 overflow-hidden flex flex-col p-4">
          <div className="font-mono text-[9px] text-ghost uppercase tracking-widest mb-2">Live Feed</div>
          <div className="flex-1 overflow-y-auto space-y-1.5">
            {recentLog.map((entry) => {
              const typeColor: Record<string, string> = {
                action: '#00ff88', message: '#00d4ff', system: '#6a8aaa', warning: '#ff8c00', error: '#ff3366',
              };
              return (
                <div key={entry.id} className="font-mono text-[9px] border-l-2 pl-2 py-0.5"
                  style={{ borderColor: typeColor[entry.type] + '66' }}>
                  <div style={{ color: typeColor[entry.type] }} className="font-bold">{entry.agentName}</div>
                  <div className="text-dim">{entry.content}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 font-mono text-[9px]">
      <span className="text-ghost w-8">{label}</span>
      <div className="flex-1 h-1 bg-steel rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, value)}%`, backgroundColor: color }} />
      </div>
      <span className="text-dim w-8 text-right">{Math.round(value)}%</span>
    </div>
  );
}
