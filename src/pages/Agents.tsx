import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { SectionHeader } from '../components/shared/SectionHeader';
import { StatusBadge } from '../components/shared/StatusDot';
import type { Agent } from '../types';

function formatUptime(s: number) {
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  return d > 0 ? `${d}d ${h}h` : `${h}h`;
}

function AgentCard({ agent, selected, onClick }: { agent: Agent; selected: boolean; onClick: () => void }) {
  return (
    <motion.div
      layout
      onClick={onClick}
      className={`card p-4 cursor-pointer transition-all ${
        selected ? 'border-cyber/50 bg-cyber/5' : 'hover:border-steel'
      }`}
      whileHover={{ y: -1 }}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 border-2 bg-deck"
          style={{ borderColor: agent.color, boxShadow: `0 0 12px ${agent.color}44` }}
        >
          {agent.avatar}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-mono text-sm font-bold" style={{ color: agent.color }}>
                {agent.codename}
              </div>
              <div className="font-mono text-[10px] text-dim">{agent.role}</div>
            </div>
            <StatusBadge status={agent.status} />
          </div>

          {/* Specializations */}
          <div className="flex flex-wrap gap-1 mt-2">
            {agent.specializations.map((spec) => (
              <span key={spec} className="font-mono text-[8px] px-1.5 py-0.5 rounded border border-ghost/30 bg-deck text-ghost uppercase">
                {spec}
              </span>
            ))}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-2.5">
            <StatItem label="TASKS" value={String(agent.tasksCompleted)} color="text-matrix" />
            <StatItem label="UPTIME" value={formatUptime(agent.uptime)} color="text-cyber" />
            <StatItem label="CPU" value={`${agent.cpuLoad}%`} color={agent.cpuLoad > 80 ? 'text-plasma' : 'text-amber'} />
          </div>

          {/* Mini load bars */}
          <div className="space-y-1 mt-2">
            <MiniBar label="CPU" value={agent.cpuLoad} color={agent.color} />
            <MiniBar label="MEM" value={(agent.memoryUsed / 768) * 100} color={agent.color} />
          </div>
        </div>
      </div>

      {/* Expanded */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-steel/40">
              <div className="font-mono text-[9px] text-ghost uppercase mb-2 tracking-widest">Current Mission</div>
              <div className="font-mono text-[10px] text-mist bg-deck border border-steel rounded p-2">
                {agent.currentTask ?? '[ STANDBY — AWAITING ORDERS ]'}
              </div>
              <div className="mt-3 font-mono text-[9px] text-ghost uppercase mb-1 tracking-widest">Identity</div>
              <div className="font-mono text-[10px] text-dim">
                <span className="text-ghost">Full Name: </span>{agent.name}
              </div>
              <div className="flex gap-2 mt-3">
                <button className="flex-1 font-mono text-[10px] py-1.5 rounded border border-matrix/30 text-matrix hover:bg-matrix/10 transition-colors">
                  ASSIGN TASK
                </button>
                <button className="flex-1 font-mono text-[10px] py-1.5 rounded border border-amber/30 text-amber hover:bg-amber/10 transition-colors">
                  VIEW LOG
                </button>
                <button className="font-mono text-[10px] py-1.5 px-3 rounded border border-plasma/30 text-plasma hover:bg-plasma/10 transition-colors">
                  HALT
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div className={`font-mono text-xs font-bold ${color}`}>{value}</div>
      <div className="font-mono text-[8px] text-ghost">{label}</div>
    </div>
  );
}

function MiniBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 font-mono text-[8px]">
      <span className="text-ghost w-6">{label}</span>
      <div className="flex-1 h-0.5 bg-steel rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, value)}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export function Agents() {
  const { agents, selectedAgentId, selectAgent } = useAppStore();
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const online  = agents.filter((a) => a.status !== 'offline');
  const offline = agents.filter((a) => a.status === 'offline');

  return (
    <div className="p-5 h-full overflow-y-auto">
      <SectionHeader
        title="Agent Roster"
        subtitle={`${online.length} online — ${offline.length} offline`}
        accent="matrix"
      >
        <div className="flex gap-1 border border-steel rounded overflow-hidden">
          {(['grid', 'list'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`font-mono text-[10px] px-2.5 py-1 transition-colors ${
                view === v ? 'bg-matrix/20 text-matrix' : 'text-ghost hover:text-mist'
              }`}
            >
              {v.toUpperCase()}
            </button>
          ))}
        </div>
      </SectionHeader>

      <motion.div
        layout
        className={view === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}
      >
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            selected={selectedAgentId === agent.id}
            onClick={() => selectAgent(selectedAgentId === agent.id ? null : agent.id)}
          />
        ))}
      </motion.div>
    </div>
  );
}
