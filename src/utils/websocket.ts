import WebSocket from 'ws';

export class WebSocketManager {
  private static instance: WebSocketManager;
  private clients: Map<string, WebSocket> = new Map();

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  addClient(orderId: string, ws: WebSocket): void {
    this.clients.set(orderId, ws);
  }

  broadcast(orderId: string, data: any): void {
    const client = this.clients.get(orderId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }

  removeClient(orderId: string): void {
    this.clients.delete(orderId);
  }
}