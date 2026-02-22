import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';

const WS_URL = import.meta.env.VITE_WS_URL ?? `ws://${window.location.hostname}:3001/ws`;

export function useSocket() {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    applySnapshot,
    applyAgentUpdate,
    applyTaskUpdate,
    applyLogEntry,
    applyStatsUpdate,
    setWsConnected,
  } = useAppStore();

  useEffect(() => {
    let dead = false;

    function connect() {
      if (dead) return;

      const ws = new WebSocket(WS_URL);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log('[WS] Connected');
        setWsConnected(true);
      };

      ws.onmessage = (evt) => {
        try {
          const event = JSON.parse(evt.data as string);
          switch (event.type) {
            case 'snapshot':      applySnapshot(event.payload);     break;
            case 'agent_update':  applyAgentUpdate(event.payload);  break;
            case 'task_update':   applyTaskUpdate(event.payload);   break;
            case 'log_entry':     applyLogEntry(event.payload);     break;
            case 'stats_update':  applyStatsUpdate(event.payload);  break;
          }
        } catch {
          // ignore parse errors
        }
      };

      ws.onerror = () => {
        setWsConnected(false);
      };

      ws.onclose = () => {
        setWsConnected(false);
        if (!dead) {
          console.log('[WS] Reconnecting in 3s...');
          reconnectTimer.current = setTimeout(connect, 3000);
        }
      };
    }

    connect();

    return () => {
      dead = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      socketRef.current?.close();
    };
  }, [applySnapshot, applyAgentUpdate, applyTaskUpdate, applyLogEntry, applyStatsUpdate, setWsConnected]);

  return socketRef;
}
