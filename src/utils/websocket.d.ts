import WebSocket from 'ws';
export declare class WebSocketManager {
    private static instance;
    private clients;
    static getInstance(): WebSocketManager;
    addClient(orderId: string, ws: WebSocket): void;
    broadcast(orderId: string, data: any): void;
    removeClient(orderId: string): void;
}
//# sourceMappingURL=websocket.d.ts.map