import WebSocket from 'ws';
export class WebSocketManager {
    static instance;
    clients = new Map();
    static getInstance() {
        if (!WebSocketManager.instance) {
            WebSocketManager.instance = new WebSocketManager();
        }
        return WebSocketManager.instance;
    }
    addClient(orderId, ws) {
        this.clients.set(orderId, ws);
    }
    broadcast(orderId, data) {
        const client = this.clients.get(orderId);
        if (client && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    }
    removeClient(orderId) {
        this.clients.delete(orderId);
    }
}
//# sourceMappingURL=websocket.js.map