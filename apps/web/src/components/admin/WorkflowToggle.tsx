'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { trpc } from '@/lib/trpc/client';

type WorkflowMode = 'scheduled' | 'continuous' | 'on-demand';

interface ModeConfig {
  label: string;
  description: string;
  color: string;
  icon: string;
}

const MODES: Record<WorkflowMode, ModeConfig> = {
  scheduled: {
    label: 'Scheduled',
    description: 'Generate articles at fixed intervals. Best for consistent publishing.',
    color: 'var(--accent-cyan)',
    icon: '⏱',
  },
  continuous: {
    label: 'Continuous',
    description: 'Generate articles continuously at max speed. Best for high-volume coverage.',
    color: '#22c55e',
    icon: '⚡',
  },
  'on-demand': {
    label: 'On-Demand',
    description: 'Generate only when manually triggered. Best for controlled publishing.',
    color: 'var(--accent-purple)',
    icon: '🎯',
  },
};

const VALID_MODES: WorkflowMode[] = ['scheduled', 'continuous', 'on-demand'];

function isValidMode(value: unknown): value is WorkflowMode {
  return typeof value === 'string' && VALID_MODES.includes(value as WorkflowMode);
}

export function WorkflowToggle() {
  const utils = trpc.useContext();
  const statusQuery = trpc.workflow.status.useQuery(undefined, {
    refetchOnWindowFocus: true,
  });

  // Local state is only used for unsaved user edits.
  // Server data is the single source of truth after each fetch.
  const [localMode, setLocalMode] = useState<WorkflowMode | null>(null);
  const [localInterval, setLocalInterval] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Derive displayed values: local override > server data > defaults
  const serverMode = isValidMode(statusQuery.data?.mode) ? statusQuery.data.mode : 'scheduled';
  const serverInterval = statusQuery.data?.interval ?? 300;
  const serverRunning = statusQuery.data?.running ?? false;

  const mode = localMode ?? serverMode;
  const interval = localInterval ?? serverInterval;
  const running = serverRunning;
  const isLoaded = statusQuery.isSuccess;

  // Clear local overrides when server data arrives (so refresh syncs correctly)
  useEffect(() => {
    if (statusQuery.isSuccess) {
      setLocalMode(null);
      setLocalInterval(null);
    }
  }, [statusQuery.isSuccess, statusQuery.dataUpdatedAt]);

  const startMutation = trpc.workflow.start.useMutation({
    onSuccess: (data) => {
      setError(null);
      setLocalMode(null);
      setLocalInterval(null);
      if (data.companyCount === 0) {
        setSuccessMsg('No active companies found. Add a company first.');
      } else {
        setSuccessMsg(`Started! Queued ${data.queued} job(s) for ${data.companyCount} company(ies).`);
      }
      // Immediately update cache so UI shows "Running"
      utils.workflow.status.setData(undefined, () => ({
        running: true,
        mode,
        interval,
      }));
      // Also refetch from server to confirm
      utils.workflow.status.invalidate();
      setTimeout(() => setSuccessMsg(null), 5000);
    },
    onError: (err) => {
      setError(err.message || 'Failed to start workflow. Check Redis connection.');
      setSuccessMsg(null);
    },
  });

  const stopMutation = trpc.workflow.stop.useMutation({
    onSuccess: () => {
      setError(null);
      setSuccessMsg('Workflow stopped.');
      // Immediately update cache so UI shows "Stopped"
      utils.workflow.status.setData(undefined, (prev) => ({
        mode: prev?.mode ?? 'scheduled',
        interval: prev?.interval ?? 300,
        running: false,
      }));
      utils.workflow.status.invalidate();
      setTimeout(() => setSuccessMsg(null), 3000);
    },
    onError: (err) => {
      setError(err.message || 'Failed to stop workflow.');
    },
  });

  const isPending = startMutation.isPending || stopMutation.isPending;

  const handleStart = async () => {
    setError(null);
    setSuccessMsg(null);
    try {
      await startMutation.mutateAsync({ mode, intervalSeconds: interval });
    } catch {
      // Error handled by onError callback
    }
  };

  const handleModeChange = (nextMode: WorkflowMode) => {
    setLocalMode(nextMode);
    setError(null);
    setSuccessMsg(null);
  };

  const handleIntervalChange = (value: number) => {
    setLocalInterval(value);
  };

  const handleStop = async () => {
    setError(null);
    setSuccessMsg(null);
    try {
      await stopMutation.mutateAsync();
    } catch {
      // Error handled by onError callback
    }
  };

  const activeConfig = MODES[mode];
  const hasUnsavedChanges = localMode !== null || localInterval !== null;

  return (
    <div className="space-y-8">
      {/* Worker Control Panel */}
      <GlassCard>
        <div className="flex flex-col gap-5">
          {/* Status row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                {!isLoaded ? (
                  <div className="w-3.5 h-3.5 rounded-full bg-gray-500 animate-pulse" />
                ) : (
                  <>
                    <div
                      className={`w-3.5 h-3.5 rounded-full ${
                        running ? 'bg-green-400' : 'bg-gray-500'
                      }`}
                    />
                    {running && (
                      <div className="absolute inset-0 w-3.5 h-3.5 rounded-full bg-green-400 animate-ping opacity-40" />
                    )}
                  </>
                )}
              </div>
              <div>
                <h3 className="text-base font-semibold text-(--text-primary)">
                  {!isLoaded ? 'Loading...' : running ? 'Worker Running' : 'Worker Stopped'}
                </h3>
                <p className="text-xs text-(--text-muted) font-mono mt-0.5">
                  Mode: {activeConfig.label}
                  {mode === 'scheduled' && ` (every ${Math.floor(interval / 60)}m ${interval % 60}s)`}
                  {hasUnsavedChanges && (
                    <span className="text-yellow-400 ml-2">- unsaved</span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={running ? handleStop : handleStart}
              disabled={isPending || !isLoaded}
              className={`px-6 py-2.5 text-sm font-medium rounded-lg border transition-all duration-200 ${
                isPending || !isLoaded
                  ? 'border-gray-500/30 text-gray-500 cursor-not-allowed opacity-50'
                  : running
                    ? 'border-red-400/40 text-red-400 hover:bg-red-400/10 hover:border-red-400/60'
                    : 'border-green-400/40 text-green-400 hover:bg-green-400/10 hover:border-green-400/60'
              }`}
            >
              {isPending
                ? 'Processing...'
                : running
                  ? 'Stop Worker'
                  : 'Start Worker'}
            </button>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
          {successMsg && (
            <div className="rounded-lg bg-green-500/10 border border-green-500/30 px-4 py-3">
              <p className="text-sm text-green-400">{successMsg}</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Mode Selection */}
      <div>
        <h3 className="text-sm font-semibold text-(--text-primary) mb-3 uppercase tracking-wider">
          Generation Mode
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.entries(MODES) as [WorkflowMode, ModeConfig][]).map(([key, config]) => {
            const isActive = mode === key;
            return (
              <button
                key={key}
                onClick={() => handleModeChange(key)}
                className="relative text-left p-5 rounded-xl border transition-all duration-200 group"
                style={{
                  backgroundColor: isActive ? `color-mix(in srgb, ${config.color} 8%, var(--bg-card))` : 'var(--bg-card)',
                  borderColor: isActive ? `color-mix(in srgb, ${config.color} 50%, transparent)` : 'var(--border-primary)',
                }}
              >
                {isActive && (
                  <div
                    className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                )}
                <div className="flex items-center gap-2.5 mb-2.5">
                  <span className="text-lg">{config.icon}</span>
                  <h4
                    className="text-sm font-bold"
                    style={{ color: isActive ? config.color : 'var(--text-secondary)' }}
                  >
                    {config.label}
                  </h4>
                </div>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: isActive ? 'var(--text-secondary)' : 'var(--text-muted)' }}
                >
                  {config.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interval Config (only for scheduled) */}
      {mode === 'scheduled' && (
        <GlassCard glow="cyan">
          <h3 className="text-sm font-semibold text-(--text-primary) mb-4 uppercase tracking-wider">
            Generation Interval
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={interval}
                onChange={(e) => handleIntervalChange(Number((e.target as any).value))}
                min={30}
                step={30}
                className="w-28 bg-(--bg-primary) border border-(--border-primary) rounded-lg px-3 py-2 text-sm text-(--text-primary) font-mono focus:outline-none focus:border-(--accent-cyan)/50"
              />
              <span className="text-xs text-(--text-muted)">seconds</span>
            </div>
            <div className="h-6 w-px bg-(--border-primary)" />
            <span className="text-sm font-mono" style={{ color: 'var(--accent-cyan)' }}>
              {Math.floor(interval / 60)}m {interval % 60}s
            </span>
          </div>
        </GlassCard>
      )}

      {/* Help text */}
      <div className="rounded-xl border border-(--border-primary) bg-(--bg-card)/50 p-5">
        <h4 className="text-xs font-semibold text-(--text-muted) uppercase tracking-wider mb-3">How it works</h4>
        <div className="space-y-2 text-xs text-(--text-muted) leading-relaxed">
          <p>1. Select a generation mode above</p>
          <p>2. Click <span className="text-green-400 font-medium">Start Worker</span> to begin generating articles</p>
          <p>3. The worker will queue jobs for each active company</p>
          <p>4. AI reporters write articles, the CEO agent reviews them</p>
          <p className="text-(--text-muted)/60 mt-2">
            Make sure you have at least one active company, reporters, and an AI provider configured.
          </p>
        </div>
      </div>
    </div>
  );
}
