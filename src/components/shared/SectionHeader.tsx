import type { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  accent?: 'matrix' | 'cyber' | 'amber' | 'plasma' | 'pulse';
  children?: ReactNode;
  prefix?: string;
}

const ACCENT_CLASSES = {
  matrix: 'text-matrix glow-text-matrix',
  cyber:  'text-cyber glow-text-cyber',
  amber:  'text-amber glow-text-amber',
  plasma: 'text-plasma glow-text-plasma',
  pulse:  'text-pulse',
};

export function SectionHeader({
  title,
  subtitle,
  accent = 'matrix',
  children,
  prefix = '///',
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-xs text-ghost">{prefix}</span>
          <h2 className={`font-mono text-sm font-semibold uppercase tracking-widest ${ACCENT_CLASSES[accent]}`}>
            {title}
          </h2>
        </div>
        {subtitle && (
          <p className="text-xs text-dim mt-0.5 font-mono">{subtitle}</p>
        )}
      </div>
      {children && <div>{children}</div>}
    </div>
  );
}
