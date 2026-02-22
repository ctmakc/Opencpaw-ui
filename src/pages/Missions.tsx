import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { SectionHeader } from '../components/shared/SectionHeader';
import type { Task, TaskStatus, TaskPriority, MissionType, Agent } from '../types';

const STATUS_ORDER: TaskStatus[] = ['running', 'queued', 'paused', 'failed', 'done'];

const STATUS_STYLES: Record<TaskStatus, { label: string; text: string; border: string; bg: string }> = {
  running: { label: 'RUNNING', text: 'text-matrix', border: 'border-matrix/30', bg: 'bg-matrix/5'  },
  queued:  { label: 'QUEUED',  text: 'text-amber',  border: 'border-amber/30',  bg: 'bg-amber/5'   },
  paused:  { label: 'PAUSED',  text: 'text-pulse',  border: 'border-pulse/30',  bg: 'bg-pulse/5'   },
  failed:  { label: 'FAILED',  text: 'text-plasma', border: 'border-plasma/30', bg: 'bg-plasma/5'  },
  done:    { label: 'DONE',    text: 'text-dim',    border: 'border-ghost/30',  bg: 'bg-ghost/5'   },
};

const PRIORITY_DOT: Record<TaskPriority, string> = {
  critical: 'bg-plasma',
  high:     'bg-amber',
  normal:   'bg-cyber',
  low:      'bg-dim',
};

const TYPE_ICONS: Record<MissionType, string> = {
  research:   '🔍',
  code:       '⌨',
  analyze:    '📊',
  write:      '✍',
  monitor:    '👁',
  infiltrate: '🐀',
};

function TaskCard({ task, agents, selected, onClick }: {
  task: Task;
  agents: Agent[];
  selected: boolean;
  onClick: () => void;
}) {
  const st = STATUS_STYLES[task.status];
  const agent = agents.find((a) => a.id === task.assignedTo);

  return (
    <motion.div
      layout
      onClick={onClick}
      className={`card p-4 cursor-pointer transition-all duration-150 ${
        selected ? `border-cyber/50 bg-cyber/5` : `hover:border-steel`
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Type icon */}
        <div className="w-8 h-8 rounded bg-deck flex items-center justify-center text-base flex-shrink-0 border border-steel">
          {TYPE_ICONS[task.type]}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-mono text-xs text-mist font-medium leading-tight">{task.title}</h3>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[task.priority]}`} />
              <span className={`font-mono text-[9px] uppercase font-bold ${st.text}`}>{st.label}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-1.5 mt-1.5">
            {task.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="font-mono text-[8px] px-1.5 py-0.5 rounded bg-deck border border-ghost/30 text-ghost">
                #{tag}
              </span>
            ))}
            {agent && (
              <span className="ml-auto font-mono text-[9px] text-dim">{agent.avatar} {agent.codename}</span>
            )}
          </div>

          {/* Progress */}
          {task.status === 'running' && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-0.5 bg-steel rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-matrix"
                  initial={{ width: 0 }}
                  animate={{ width: `${task.progress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <span className="font-mono text-[9px] text-matrix">{task.progress}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-steel/40">
              <p className="font-mono text-[10px] text-dim mb-2">{task.description}</p>
              {task.output && (
                <div className="bg-void border border-matrix/20 rounded p-2.5 font-mono text-[10px] text-matrix">
                  <div className="text-ghost mb-1 text-[8px]">OUTPUT ///</div>
                  {task.output}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function Missions() {
  const { tasks, agents, selectedTaskId, selectTask } = useAppStore();
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');

  const filtered = tasks
    .filter((t) => filter === 'all' || t.status === filter)
    .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));

  const counts: Record<TaskStatus, number> = {
    running: tasks.filter((t) => t.status === 'running').length,
    queued:  tasks.filter((t) => t.status === 'queued').length,
    paused:  tasks.filter((t) => t.status === 'paused').length,
    failed:  tasks.filter((t) => t.status === 'failed').length,
    done:    tasks.filter((t) => t.status === 'done').length,
  };

  return (
    <div className="p-5 h-full overflow-y-auto">
      <SectionHeader
        title="Mission Queue"
        subtitle={`${tasks.length} total missions — ${counts.running} active`}
        accent="cyber"
      />

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', ...STATUS_ORDER] as const).map((s) => {
          const isActive = filter === s;
          const count    = s === 'all' ? tasks.length : counts[s];
          const textCol  = s === 'all' ? 'text-mist' : STATUS_STYLES[s]?.text ?? 'text-dim';
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`font-mono text-[10px] px-3 py-1.5 rounded border transition-all ${
                isActive
                  ? 'border-cyber/50 bg-cyber/10 text-cyber'
                  : `border-ghost/30 hover:border-steel ${textCol} hover:bg-plate`
              }`}
            >
              {s.toUpperCase()} ({count})
            </button>
          );
        })}
      </div>

      {/* Task list */}
      <motion.div layout className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              agents={agents}
              selected={selectedTaskId === task.id}
              onClick={() => selectTask(selectedTaskId === task.id ? null : task.id)}
            />
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="text-center py-12 font-mono text-sm text-ghost">
            NO MISSIONS MATCHING FILTER
          </div>
        )}
      </motion.div>
    </div>
  );
}
