'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { trpc } from '@/lib/trpc/client';
import type { AgentAnimationState, BubbleData, CompanyRoomState, ViewMode } from './newsroom-types';

type TimeoutMap = Map<string, ReturnType<typeof setTimeout>>;

function makeAgentKey(companyName: string, agentName: string) {
  return `${companyName}::${agentName}`;
}

function makeBubble(text: string, type: 'thought' | 'speech' = 'thought', durationMs = 5000): BubbleData {
  return {
    text,
    type,
    expiresAt: Date.now() + durationMs,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  };
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export { getInitials };

export function useNewsroomState() {
  const [viewMode, setViewMode] = useState<ViewMode>('slide');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Agent states map: key -> { animationState, bubble }
  const [agentStates, setAgentStates] = useState<Map<string, { state: AgentAnimationState; bubble: BubbleData | null }>>(new Map());
  const timeoutsRef = useRef<TimeoutMap>(new Map());
  const lastProcessedRef = useRef<string | null>(null);
  const mountTimeRef = useRef(Date.now());

  // tRPC queries
  const { data: pipelineData } = trpc.dashboard.pipeline.useQuery();
  const { data: workflowStatus } = trpc.workflow.status.useQuery(undefined, { refetchInterval: 5000 });
  const isRunning = workflowStatus?.running ?? false;

  const { data: logsData } = trpc.dashboard.logs.useQuery(
    { limit: 20 },
    { refetchInterval: isRunning ? 3000 : false },
  );

  const { data: reviewData } = trpc.dashboard.reviewLogs.useQuery(
    { limit: 10 },
    { refetchInterval: isRunning ? 5000 : false },
  );

  // Clear all timeouts on unmount
  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      timeouts.forEach((t) => clearTimeout(t));
      timeouts.clear();
    };
  }, []);

  const setAgentState = useCallback((key: string, state: AgentAnimationState, bubble?: BubbleData | null) => {
    setAgentStates((prev) => {
      const next = new Map(prev);
      const existing = next.get(key);
      next.set(key, {
        state,
        bubble: bubble !== undefined ? bubble : existing?.bubble ?? null,
      });
      return next;
    });
  }, []);

  const scheduleTransition = useCallback((key: string, toState: AgentAnimationState, delayMs: number, bubble?: BubbleData | null) => {
    const existing = timeoutsRef.current.get(key);
    if (existing) clearTimeout(existing);

    const timeout = setTimeout(() => {
      setAgentState(key, toState, bubble);
      timeoutsRef.current.delete(key);
    }, delayMs);

    timeoutsRef.current.set(key, timeout);
  }, [setAgentState]);

  // Auto-dismiss bubbles
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setAgentStates((prev) => {
        let changed = false;
        const next = new Map(prev);
        for (const [key, val] of next) {
          if (val.bubble && val.bubble.expiresAt <= now) {
            next.set(key, { ...val, bubble: null });
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Process log events
  useEffect(() => {
    if (!logsData || !pipelineData || logsData.length === 0) return;

    // Only process events newer than mount time on first load
    const newestId = logsData[0]?.id;
    if (newestId === lastProcessedRef.current) return;
    lastProcessedRef.current = newestId ?? null;

    // Process from oldest to newest
    const sortedLogs = [...logsData].reverse();

    for (const log of sortedLogs) {
      const logTime = log.createdAt ? new Date(log.createdAt).getTime() : 0;
      if (logTime < mountTimeRef.current - 5000) continue; // skip old events, allow 5s buffer

      const companyName = log.companyName;
      if (!companyName || companyName === 'Unknown') continue;

      // Find company in pipeline
      const company = pipelineData.find((c) => c.name === companyName);
      if (!company) continue;

      const ceoKey = makeAgentKey(companyName, company.ceo);

      switch (log.event) {
        case 'generation_started': {
          // All reporters get ready, CEO announces
          setAgentState(ceoKey, 'idle', makeBubble('Starting new cycle...'));
          for (const r of company.reporters) {
            const rKey = makeAgentKey(companyName, r.name);
            setAgentState(rKey, 'getting-ready');
            // After 2s, transition to writing
            scheduleTransition(rKey, 'writing', 2000);
          }
          break;
        }

        case 'topics_selected': {
          const topicCount = (log.metadata as Record<string, unknown>)?.topicCategories;
          const count = Array.isArray(topicCount) ? topicCount.length : '?';
          setAgentState(ceoKey, 'reviewing', makeBubble(`Selected ${count} topics`));
          break;
        }

        case 'article_saved': {
          const reporterName = log.reporterName;
          if (reporterName) {
            const rKey = makeAgentKey(companyName, reporterName);
            const meta = log.metadata as Record<string, unknown> | null;
            const title = meta?.topic as string ?? log.message?.slice(0, 40) ?? 'Writing...';
            const status = meta?.status as string;

            // Reporter writes, then walks to CEO
            setAgentState(rKey, 'writing', makeBubble(title, 'speech'));
            scheduleTransition(rKey, 'walking-to-ceo', 2000);

            // CEO reviews after reporter walks
            setTimeout(() => {
              if (status === 'published' || status === 'approved') {
                setAgentState(ceoKey, 'approved', makeBubble('Approved!', 'speech'));
                scheduleTransition(rKey, 'approved', 500);
                scheduleTransition(rKey, 'idle', 4500);
                scheduleTransition(ceoKey, 'idle', 4000);
              } else if (status === 'rejected') {
                setAgentState(ceoKey, 'rejected', makeBubble('Rejected', 'speech'));
                scheduleTransition(rKey, 'rejected', 500);
                scheduleTransition(rKey, 'idle', 4500);
                scheduleTransition(ceoKey, 'idle', 4000);
              } else {
                setAgentState(ceoKey, 'reviewing', makeBubble('Reviewing...'));
                scheduleTransition(rKey, 'idle', 4000);
                scheduleTransition(ceoKey, 'idle', 4000);
              }
            }, 3500);
          }
          break;
        }

        case 'review_started': {
          const reporterName = log.reporterName;
          if (reporterName) {
            const rKey = makeAgentKey(companyName, reporterName);
            setAgentState(rKey, 'walking-to-ceo');
            setAgentState(ceoKey, 'reviewing', makeBubble('Reviewing...'));
          }
          break;
        }

        case 'article_approved': {
          const reporterName = log.reporterName;
          const meta = log.metadata as Record<string, unknown> | null;
          const score = meta?.score;
          setAgentState(ceoKey, 'approved', makeBubble(`Approved!${score ? ` Score: ${score}` : ''}`, 'speech'));
          if (reporterName) {
            const rKey = makeAgentKey(companyName, reporterName);
            setAgentState(rKey, 'approved');
            scheduleTransition(rKey, 'idle', 4000);
          }
          scheduleTransition(ceoKey, 'idle', 4000);
          break;
        }

        case 'article_rejected': {
          const reporterName = log.reporterName;
          setAgentState(ceoKey, 'rejected', makeBubble('Rejected', 'speech'));
          if (reporterName) {
            const rKey = makeAgentKey(companyName, reporterName);
            setAgentState(rKey, 'rejected');
            scheduleTransition(rKey, 'idle', 4000);
          }
          scheduleTransition(ceoKey, 'idle', 4000);
          break;
        }

        case 'article_generation_failed':
        case 'article_save_failed': {
          const reporterName = log.reporterName;
          if (reporterName) {
            const rKey = makeAgentKey(companyName, reporterName);
            setAgentState(rKey, 'failed', makeBubble('Failed...', 'thought'));
            scheduleTransition(rKey, 'idle', 4000);
          }
          break;
        }

        case 'generation_completed': {
          setAgentState(ceoKey, 'done', makeBubble('Cycle complete'));
          for (const r of company.reporters) {
            const rKey = makeAgentKey(companyName, r.name);
            setAgentState(rKey, 'done');
            scheduleTransition(rKey, 'idle', 3000);
          }
          scheduleTransition(ceoKey, 'idle', 3000);
          break;
        }
      }
    }
  }, [logsData, pipelineData, setAgentState, scheduleTransition]);

  // Build rooms from pipeline + agent states
  const rooms: CompanyRoomState[] = (pipelineData ?? []).map((company) => {
    const ceoKey = makeAgentKey(company.name, company.ceo);
    const ceoState = agentStates.get(ceoKey);

    return {
      companyName: company.name,
      isActive: isRunning,
      ceo: {
        key: ceoKey,
        name: company.ceo,
        model: company.ceoModel ?? '',
        role: 'ceo' as const,
        animationState: ceoState?.state ?? 'idle',
        bubble: ceoState?.bubble ?? null,
      },
      reporters: company.reporters.map((r) => {
        const rKey = makeAgentKey(company.name, r.name);
        const rState = agentStates.get(rKey);
        return {
          key: rKey,
          name: r.name,
          model: r.model,
          role: 'reporter' as const,
          animationState: rState?.state ?? 'idle',
          bubble: rState?.bubble ?? null,
        };
      }),
    };
  });

  return {
    rooms,
    isRunning,
    viewMode,
    setViewMode,
    currentSlideIndex,
    setCurrentSlideIndex,
    reviewData: reviewData ?? [],
  };
}
