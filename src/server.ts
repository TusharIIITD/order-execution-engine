import 'dotenv/config';
import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import ordersRoutes from './routes/orders.js';
import { WebSocketManager } from './utils/websocket.js';

export const fastify = Fastify({ logger: true });
fastify.register(fastifyWebsocket);

fastify.register(async (fastify) => {
  fastify.get('/ws/orders/:orderId', { websocket: true }, (connection: any, req: any) => {
    const { orderId } = req.params;
    const wsManager = WebSocketManager.getInstance();
    wsManager.addClient(orderId, connection.socket);

    connection.socket.on('close', () => {
      wsManager.removeClient(orderId);
    });
  });
});

fastify.register(ordersRoutes);

fastify.get('/health', async () => ({ status: 'ok' }));

const start = async () => {
  try {
    await fastify.listen({ port: parseInt(process.env.PORT || '3000'), host: '0.0.0.0' });
    console.log('Server running on http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();