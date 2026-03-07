'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { trpc } from '@/lib/trpc/client';

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

const WORKFLOW_MODE_KEY = 'jaurnalist-workflow-mode';
const WORKFLOW_INTERVAL_KEY = 'jaurnalist-workflow-interval';

function readModeFromStorage(): WorkflowMode | null {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(WORKFLOW_MODE_KEY);
  if (stored && (['scheduled', 'continuous', 'on-demand'] as WorkflowMode[]).includes(stored as WorkflowMode)) {
    return stored as WorkflowMode;
  }
  return null;
}

function readIntervalFromStorage(): number | null {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(WORKFLOW_INTERVAL_KEY);
  const parsed = stored ? Number(stored) : NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

export function WorkflowToggle() {
  const utils = trpc.useContext();
  const statusQuery = trpc.workflow.status.useQuery();
  const storedMode = readModeFromStorage();
  const storedInterval = readIntervalFromStorage();
  const initialMode = storedMode ?? statusQuery.data?.mode ?? 'scheduled';
  const initialInterval = storedInterval ?? statusQuery.data?.interval ?? 300;
  const [mode, setMode] = useState<WorkflowMode>(initialMode);
  const [interval, setInterval] = useState(initialInterval);
  const [dirty, setDirty] = useState(false);

  const startMutation = trpc.workflow.start.useMutation();
  const stopMutation = trpc.workflow.stop.useMutation({
    onSuccess: () => {
      utils.workflow.status.setData(undefined, (prev) => ({
        ...(prev ?? { mode: 'scheduled', interval: 300 }),
        running: false,
      }));
    },
  });

  useEffect(() => {
    if (statusQuery.isSuccess && statusQuery.data && !dirty) {
      setMode(statusQuery.data.mode as WorkflowMode);
      setInterval(statusQuery.data.interval ?? 300);
    }
  }, [statusQuery.isSuccess, statusQuery.data, dirty]);

  const running = statusQuery.data?.running ?? false;
  const isPending = startMutation.isPending || stopMutation.isPending || statusQuery.isLoading;

  const handleStart = async () => {
    await startMutation.mutateAsync({ mode, intervalSeconds: interval });
    setDirty(false);
    window.localStorage.setItem(WORKFLOW_MODE_KEY, mode);
    window.localStorage.setItem(WORKFLOW_INTERVAL_KEY, interval.toString());
    utils.workflow.status.setData(undefined, () => ({
      running: true,
      mode,
      interval,
    }));
  };

  const handleModeChange = (nextMode: WorkflowMode) => {
    setMode(nextMode);
    setDirty(true);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(WORKFLOW_MODE_KEY, nextMode);
    }
  };

  const handleIntervalChange = (value: number) => {
    setInterval(value);
    setDirty(true);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(WORKFLOW_INTERVAL_KEY, value.toString());
    }
  };

  const handleStop = async () => {
    await stopMutation.mutateAsync();
  };

  return (
    <div className="space-y-6">
      {/* Status */}
      <GlassCard>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                running ? 'bg-green-400 animate-pulse' : 'bg-(--text-muted)'
              }`}
            />
            <div>
              <h3 className="text-sm font-semibold text-(--text-primary)">
                Worker Status
              </h3>
              <p className="text-xs text-(--text-muted) font-mono">
                {statusQuery.isLoading ? 'Loading worker status…' : running ? 'Running' : 'Stopped'}{' '}
                &middot; Mode: {MODES[mode]?.label ?? 'Scheduled'}
              </p>
            </div>
          </div>
          <button
            onClick={running ? handleStop : handleStart}
            disabled={isPending}
            className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
              isPending
                ? 'border-gray-400/30 text-gray-400 cursor-not-allowed'
                : running
                  ? 'border-red-400/40 text-red-400 hover:bg-red-400/10'
                  : 'border-green-400/40 text-green-400 hover:bg-green-400/10'
            }`}
          >
            {running ? 'Stop Worker' : 'Start Worker'}
          </button>
        </div>
        {startMutation.data && (
          <p className="text-xs text-(--text-muted) mt-4 font-mono">
            Queued {startMutation.data.queued} job{startMutation.data.queued === 1 ? '' : 's'} for{' '}
            {startMutation.data.companyCount} active company{startMutation.data.companyCount === 1 ? '' : 'ies'}.
          </p>
        )}
      </GlassCard>

      {/* Mode selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.entries(MODES) as [WorkflowMode, ModeConfig][]).map(([key, config]) => {
          const isActive = mode === key;
          return (
            <button
              key={key}
              onClick={() => handleModeChange(key)}
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
              <p className="text-xs text-(--text-muted) leading-relaxed">
                {config.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Interval (only for scheduled mode) */}
      {mode === 'scheduled' && (
        <GlassCard glow="cyan">
          <h3 className="text-sm font-semibold text-(--text-primary) mb-3">
            Generation Interval
          </h3>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={interval}
              onChange={(e) => handleIntervalChange(Number(e.target.value))}
              min={30}
              step={30}
              className="w-32 bg-(--bg-primary) border border-(--border-primary) rounded-lg px-3 py-2 text-sm text-(--text-primary) font-mono focus:outline-none focus:border-(--accent-cyan)/50"
            />
            <span className="text-xs text-(--text-muted)">
              seconds ({Math.floor(interval / 60)}m {interval % 60}s)
            </span>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
