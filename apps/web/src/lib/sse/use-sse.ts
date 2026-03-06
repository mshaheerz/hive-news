'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface SSEOptions {
  url: string;
  onMessage?: (event: MessageEvent) => void;
  onError?: (error: Event) => void;
  enabled?: boolean;
}

export function useSSE({ url, onMessage, onError, enabled = true }: SSEOptions) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => setConnected(true);
    es.onmessage = (event) => onMessage?.(event);
    es.onerror = (error) => {
      setConnected(false);
      onError?.(error);
    };

    return () => {
      es.close();
      setConnected(false);
    };
  }, [url, enabled]);

  const close = useCallback(() => {
    eventSourceRef.current?.close();
    setConnected(false);
  }, []);

  return { connected, close };
}
