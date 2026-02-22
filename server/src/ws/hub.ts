import type { WebSocket } from 'ws';
import type { WsEvent } from '../types.js';

const clients = new Set<WebSocket>();

export function addClient(ws: WebSocket) {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
}

export function broadcast(event: WsEvent) {
  const data = JSON.stringify(event);
  for (const client of clients) {
    if (client.readyState === 1 /* OPEN */) {
      client.send(data);
    }
  }
}

export function clientCount() {
  return clients.size;
}
