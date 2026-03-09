'use client';

import type { CompanyRoomState } from './newsroom-types';
import { AgentAvatar } from './AgentAvatar';

interface CompanyRoomProps {
  room: CompanyRoomState;
  colorIndex: number;
  compact?: boolean;
}

const COMPANY_COLORS = [
  { accent: '#a78bfa', border: 'rgba(139,92,246,0.4)' },
  { accent: '#00f0ff', border: 'rgba(0,240,255,0.4)' },
  { accent: '#22c55e', border: 'rgba(34,197,94,0.4)' },
  { accent: '#f59e0b', border: 'rgba(245,158,11,0.4)' },
  { accent: '#ec4899', border: 'rgba(236,72,153,0.4)' },
  { accent: '#3b82f6', border: 'rgba(59,130,246,0.4)' },
];

const REPORTER_COLORS = [
  '#00f0ff', '#f0c040', '#40f080', '#ff6090',
  '#f08040', '#c080ff', '#80d0ff', '#ff80b0',
];

export function CompanyRoom({ room, colorIndex, compact = false }: CompanyRoomProps) {
  const colors = COMPANY_COLORS[colorIndex % COMPANY_COLORS.length]!;
  const avatarSize = compact ? 'sm' as const : 'md' as const;
  const ceoSize = compact ? 'md' as const : 'lg' as const;

  return (
    <div
      className="glass-card rounded-xl border overflow-hidden flex flex-col"
      style={{ borderColor: colors.border }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: colors.border }}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold truncate" style={{ color: colors.accent }}>
            {room.companyName}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`w-2 h-2 rounded-full ${room.isActive ? 'animate-pulse' : ''}`}
            style={{ backgroundColor: room.isActive ? '#22c55e' : 'var(--text-secondary)' }}
          />
          <span className="text-[10px] font-mono" style={{ color: room.isActive ? '#22c55e' : 'var(--text-secondary)' }}>
            {room.isActive ? 'LIVE' : 'IDLE'}
          </span>
        </div>
      </div>

      {/* Office layout */}
      <div className="flex-1 flex flex-col p-4 gap-3" style={{ minHeight: compact ? 200 : 260 }}>
        {/* CEO Desk Area */}
        <div className="flex flex-col items-center">
          <div className="text-[9px] font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>
            CEO Office
          </div>
          <div
            className="relative rounded-lg px-6 py-3 flex items-center justify-center"
            style={{
              background: 'rgba(0, 240, 255, 0.05)',
              border: '1px dashed rgba(0, 240, 255, 0.2)',
            }}
          >
            <AgentAvatar
              agent={room.ceo}
              size={ceoSize}
              color="#00f0ff"
              showBubble={!compact}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2 px-2">
          <div className="flex-1 border-t border-dashed" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
          <span className="text-[8px] font-mono uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
            Reporters
          </span>
          <div className="flex-1 border-t border-dashed" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Reporter Desks */}
        <div className="flex-1 flex items-start justify-center">
          {room.reporters.length === 0 ? (
            <div className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
              No reporters assigned
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 justify-center">
              {room.reporters.map((reporter, ri) => {
                const rColor = REPORTER_COLORS[(colorIndex * 10 + ri) % REPORTER_COLORS.length]!;
                return (
                  <div
                    key={reporter.key}
                    className="relative rounded-lg px-3 py-2 flex items-center justify-center"
                    style={{
                      background: `${rColor}08`,
                      border: `1px solid ${rColor}20`,
                    }}
                  >
                    <AgentAvatar
                      agent={reporter}
                      size={avatarSize}
                      color={rColor}
                      showBubble={!compact}
                      walkOffset={compact ? 60 : 90}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
