'use client';

import { useEffect, useState } from 'react';
import type { BubbleData } from './newsroom-types';

interface ThoughtBubbleProps {
  bubble: BubbleData;
  position?: 'above' | 'right';
}

export function ThoughtBubble({ bubble, position = 'above' }: ThoughtBubbleProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const remaining = bubble.expiresAt - Date.now();
    if (remaining <= 0) {
      setExiting(true);
      return;
    }
    // Start exit animation 400ms before expiry
    const timer = setTimeout(() => setExiting(true), Math.max(0, remaining - 400));
    return () => clearTimeout(timer);
  }, [bubble.expiresAt]);

  const positionClasses = position === 'above'
    ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
    : 'left-full top-0 ml-2';

  return (
    <div
      className={`absolute ${positionClasses} z-20 pointer-events-none ${exiting ? 'nr-bubble-exit' : 'nr-bubble-enter'}`}
    >
      <div
        className="relative px-2.5 py-1.5 rounded-lg text-[11px] leading-snug font-mono max-w-[180px] whitespace-normal"
        style={{
          background: 'rgba(26, 26, 46, 0.9)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          backdropFilter: 'blur(8px)',
          color: 'var(--text-primary)',
        }}
      >
        <span className="line-clamp-2">{bubble.text}</span>
        {/* Tail */}
        {position === 'above' && (
          <div
            className="absolute top-full left-1/2 -translate-x-1/2"
            style={{
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '5px solid rgba(139, 92, 246, 0.3)',
            }}
          />
        )}
        {position === 'right' && (
          <div
            className="absolute top-3 right-full"
            style={{
              width: 0,
              height: 0,
              borderTop: '5px solid transparent',
              borderBottom: '5px solid transparent',
              borderRight: '5px solid rgba(139, 92, 246, 0.3)',
            }}
          />
        )}
      </div>
    </div>
  );
}
