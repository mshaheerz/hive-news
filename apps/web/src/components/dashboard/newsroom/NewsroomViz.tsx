'use client';

import './newsroom-animations.css';
import { useNewsroomState } from './useNewsroomState';
import { CompanyRoom } from './CompanyRoom';
import type { ViewMode } from './newsroom-types';

function ViewModeToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <div className="flex rounded-lg border border-(--border-primary) overflow-hidden">
      {(['slide', 'grid'] as const).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className="px-3 py-1 text-[11px] font-mono uppercase tracking-wider transition-colors"
          style={{
            background: mode === m ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
            color: mode === m ? '#a78bfa' : 'var(--text-secondary)',
          }}
        >
          {m}
        </button>
      ))}
    </div>
  );
}

export function NewsroomViz() {
  const {
    rooms,
    isRunning,
    viewMode,
    setViewMode,
    currentSlideIndex,
    setCurrentSlideIndex,
  } = useNewsroomState();

  if (rooms.length === 0) {
    return (
      <div className="glass-card rounded-xl border border-(--border-primary) p-8 text-center">
        <div className="text-3xl mb-3 opacity-20 font-mono">&gt;_</div>
        <h3 className="text-sm font-semibold text-(--text-secondary) mb-1">No newsroom data</h3>
        <p className="text-xs text-(--text-muted)">
          Add companies with CEOs and reporters in Settings to see the live newsroom.
        </p>
      </div>
    );
  }

  const clampedIndex = Math.min(currentSlideIndex, rooms.length - 1);

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-(--text-primary)">Live Newsroom</h2>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${isRunning ? 'animate-pulse' : ''}`}
              style={{ backgroundColor: isRunning ? '#22c55e' : 'var(--text-secondary)' }}
            />
            <span className="text-[10px] font-mono" style={{ color: isRunning ? '#22c55e' : 'var(--text-secondary)' }}>
              {isRunning ? 'WORKFLOW ACTIVE' : 'IDLE'}
            </span>
          </div>
        </div>
        <ViewModeToggle mode={viewMode} onChange={setViewMode} />
      </div>

      {/* Slide mode */}
      {viewMode === 'slide' && (
        <div className="relative">
          <CompanyRoom
            room={rooms[clampedIndex]!}
            colorIndex={clampedIndex}
          />

          {/* Navigation */}
          {rooms.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-3">
              <button
                onClick={() => setCurrentSlideIndex((clampedIndex - 1 + rooms.length) % rooms.length)}
                className="px-3 py-1.5 rounded-lg border border-(--border-primary) text-xs font-mono text-(--text-secondary) hover:text-(--accent-cyan) hover:border-(--accent-cyan)/40 transition-colors"
              >
                &larr; Prev
              </button>

              {/* Dot indicators */}
              <div className="flex gap-1.5">
                {rooms.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlideIndex(i)}
                    className="w-2 h-2 rounded-full transition-colors"
                    style={{
                      backgroundColor: i === clampedIndex ? '#a78bfa' : 'rgba(255,255,255,0.15)',
                    }}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentSlideIndex((clampedIndex + 1) % rooms.length)}
                className="px-3 py-1.5 rounded-lg border border-(--border-primary) text-xs font-mono text-(--text-secondary) hover:text-(--accent-cyan) hover:border-(--accent-cyan)/40 transition-colors"
              >
                Next &rarr;
              </button>
            </div>
          )}
        </div>
      )}

      {/* Grid mode */}
      {viewMode === 'grid' && (
        <div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[700px] overflow-y-auto"
          style={{ scrollbarWidth: 'thin' }}
        >
          {rooms.map((room, i) => (
            <CompanyRoom
              key={room.companyName}
              room={room}
              colorIndex={i}
              compact
            />
          ))}
        </div>
      )}
    </div>
  );
}
