'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';

type WorkflowMode = 'scheduled' | 'continuous' | 'on-demand';

interface ModeConfig {
  label: string;
  description: string;
  color: string;
}

const MODES: Record<WorkflowMode, ModeConfig> = {
  scheduled: {
    label: 'Scheduled',
    description: 'Articles are generated at fixed time intervals. Best for consistent publishing schedules.',
    color: 'var(--accent-cyan)',
  },
  continuous: {
    label: 'Continuous',
    description: 'Articles are generated continuously as fast as possible. Best for high-volume news coverage.',
    color: '#22c55e',
  },
  'on-demand': {
    label: 'On-Demand',
    description: 'Articles are only generated when manually triggered. Best for controlled publishing.',
    color: 'var(--accent-purple)',
  },
};

export function WorkflowToggle() {
  const [mode, setMode] = useState<WorkflowMode>('scheduled');
  const [interval, setInterval] = useState(300);
  const [running, setRunning] = useState(false);

  const handleStart = async () => {
    // TODO: Call API to start worker
    setRunning(true);
  };

  const handleStop = async () => {
    // TODO: Call API to stop worker
    setRunning(false);
  };

  return (
    <div className="space-y-6">
      {/* Status */}
      <GlassCard>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                running ? 'bg-green-400 animate-pulse' : 'bg-[var(--text-muted)]'
              }`}
            />
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Worker Status
              </h3>
              <p className="text-xs text-[var(--text-muted)] font-mono">
                {running ? 'Running' : 'Stopped'} &middot; Mode: {MODES[mode].label}
              </p>
            </div>
          </div>
          <button
            onClick={running ? handleStop : handleStart}
            className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
              running
                ? 'border-red-400/40 text-red-400 hover:bg-red-400/10'
                : 'border-green-400/40 text-green-400 hover:bg-green-400/10'
            }`}
          >
            {running ? 'Stop Worker' : 'Start Worker'}
          </button>
        </div>
      </GlassCard>

      {/* Mode selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.entries(MODES) as [WorkflowMode, ModeConfig][]).map(([key, config]) => {
          const isActive = mode === key;
          return (
            <button
              key={key}
              onClick={() => setMode(key)}
              className="text-left p-4 rounded-xl border transition-all duration-200"
              style={{
                backgroundColor: isActive ? `color-mix(in srgb, ${config.color} 10%, transparent)` : 'var(--bg-card)',
                borderColor: isActive ? `color-mix(in srgb, ${config.color} 40%, transparent)` : 'var(--border-primary)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isActive ? config.color : 'var(--text-muted)' }}
                />
                <h4
                  className="text-sm font-semibold"
                  style={{ color: isActive ? config.color : 'var(--text-secondary)' }}
                >
                  {config.label}
                </h4>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {config.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Interval (only for scheduled mode) */}
      {mode === 'scheduled' && (
        <GlassCard glow="cyan">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
            Generation Interval
          </h3>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={interval}
              onChange={(e) => setInterval(Number(e.target.value))}
              min={30}
              step={30}
              className="w-32 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--accent-cyan)]/50"
            />
            <span className="text-xs text-[var(--text-muted)]">
              seconds ({Math.floor(interval / 60)}m {interval % 60}s)
            </span>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
