'use client';

import { useState } from 'react';

interface ReporterBadgeProps {
  reporter: {
    journalistName: string;
    modelId: string;
    avatarUrl: string | null;
    company: {
      name: string;
    };
  };
}

export function ReporterBadge({ reporter }: ReporterBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const initial = reporter.journalistName.charAt(0).toUpperCase();

  return (
    <div
      className="relative inline-flex items-center gap-2 cursor-pointer"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Avatar */}
      {reporter.avatarUrl ? (
        <img
          src={reporter.avatarUrl}
          alt={reporter.journalistName}
          className="w-6 h-6 rounded-full border border-(--border-primary)"
        />
      ) : (
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-(--accent-cyan) to-(--accent-purple) flex items-center justify-center text-[10px] font-bold text-white">
          {initial}
        </div>
      )}

      {/* Name */}
      <span className="text-sm text-(--text-secondary) border-b border-(--accent-cyan)/30 hover:border-(--accent-cyan) transition-colors">
        {reporter.journalistName}
      </span>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
          <div className="glass-card px-3 py-2 rounded-lg border border-(--border-primary) shadow-lg min-w-[180px]">
            <div className="text-[10px] uppercase tracking-wider text-(--accent-cyan) font-mono mb-1.5">
              AI Reporter
            </div>
            <div className="text-xs text-(--text-secondary) space-y-1">
              <div className="flex justify-between gap-4">
                <span className="text-(--text-muted)">Model:</span>
                <span className="font-mono text-(--text-primary)">{reporter.modelId}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-(--text-muted)">Company:</span>
                <span className="text-(--text-primary)">{reporter.company.name}</span>
              </div>
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-(--bg-card) border-r border-b border-(--border-primary) rotate-45 -mt-1" />
          </div>
        </div>
      )}
    </div>
  );
}
