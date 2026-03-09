'use client';

import type { AgentState } from './newsroom-types';
import { ThoughtBubble } from './ThoughtBubble';
import { getInitials } from './useNewsroomState';

interface AgentAvatarProps {
  agent: AgentState;
  size?: 'sm' | 'md' | 'lg';
  color: string;
  showBubble?: boolean;
  walkOffset?: number;
}

const SIZE_MAP = {
  sm: { circle: 32, text: '10px', label: '9px' },
  md: { circle: 40, text: '12px', label: '10px' },
  lg: { circle: 48, text: '14px', label: '11px' },
};

const STATE_CSS_MAP: Record<string, string> = {
  'idle': 'nr-agent-idle',
  'getting-ready': 'nr-agent-getting-ready',
  'writing': 'nr-agent-writing',
  'walking-to-ceo': 'nr-agent-walking',
  'reviewing': 'nr-agent-reviewing',
  'approved': 'nr-agent-approved',
  'rejected': 'nr-agent-rejected',
  'done': 'nr-agent-done',
  'failed': 'nr-agent-failed',
};

const STATE_BORDER_COLOR: Record<string, string> = {
  'approved': '#22c55e',
  'rejected': '#ef4444',
  'failed': '#ef4444',
  'reviewing': '#8b5cf6',
  'writing': '#00f0ff',
};

export function AgentAvatar({ agent, size = 'md', color, showBubble = true, walkOffset = 0 }: AgentAvatarProps) {
  const s = SIZE_MAP[size];
  const initials = getInitials(agent.name);
  const animClass = STATE_CSS_MAP[agent.animationState] ?? '';
  const borderColor = STATE_BORDER_COLOR[agent.animationState] ?? `${color}60`;

  const walkTransform = agent.animationState === 'walking-to-ceo' ? `translateY(${-walkOffset}px)` : 'translateY(0)';

  return (
    <div
      className="relative flex flex-col items-center gap-1"
      style={{
        transform: walkTransform,
        transition: agent.animationState === 'walking-to-ceo' ? 'transform 2s cubic-bezier(0.4, 0, 0.2, 1)' : 'transform 0.5s ease',
      }}
    >
      {/* Bubble */}
      {showBubble && agent.bubble && (
        <ThoughtBubble bubble={agent.bubble} position="above" />
      )}

      {/* Circle avatar */}
      <div
        className={`relative rounded-full flex items-center justify-center font-bold shrink-0 ${animClass}`}
        style={{
          width: s.circle,
          height: s.circle,
          background: `${color}25`,
          border: `2px solid ${borderColor}`,
          fontSize: s.text,
          color,
        }}
      >
        {initials}

        {/* Writing indicator */}
        {agent.animationState === 'writing' && (
          <div className="absolute -top-1 -right-1 flex gap-[2px]">
            <span className="nr-typing-dot" />
            <span className="nr-typing-dot" />
            <span className="nr-typing-dot" />
          </div>
        )}

        {/* Approved checkmark */}
        {agent.animationState === 'approved' && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-[9px] text-white font-bold">
            &#10003;
          </div>
        )}

        {/* Rejected X */}
        {(agent.animationState === 'rejected' || agent.animationState === 'failed') && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[9px] text-white font-bold">
            &#10005;
          </div>
        )}
      </div>

      {/* Name + model label */}
      <div className="text-center max-w-[80px]">
        <div className="truncate font-medium" style={{ fontSize: s.label, color }}>
          {agent.name}
        </div>
        {agent.model && (
          <div className="truncate font-mono" style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>
            {agent.model}
          </div>
        )}
      </div>
    </div>
  );
}
