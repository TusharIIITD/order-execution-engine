import { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database.js';
import { orderQueue } from '../services/orderQueue.js';
// import { WebSocketManager } from '../utils/websocket.js';

export default async function ordersRoutes(fastify: FastifyInstance) {
  fastify.post('/api/orders/execute', async (request, reply) => {
    const { tokenIn, tokenOut, amountIn, slippage = 0.01 } = request.body as any;

    if (!tokenIn || !tokenOut || !amountIn) {
      return reply.code(400).send({ error: 'Missing required fields' });
    }

    const orderId = uuidv4();
    const order = {
      id: orderId,
      tokenIn,
      tokenOut,
      amountIn,
      slippage,
      status: 'pending' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to DB
    await pool.query(
      'INSERT INTO orders (id, token_in, token_out, amount_in, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [order.id, order.tokenIn, order.tokenOut, order.amountIn, order.status, order.createdAt, order.updatedAt]
    );

    // Add to queue
    await orderQueue.add('execute', order);
    console.log(`[Queue] Order ${orderId} added to queue`);

    // Upgrade to WebSocket for status updates
    reply.header('Upgrade', 'websocket');
    reply.code(200).send({ orderId });
  });

  fastify.get('/api/orders/:id', async (request, reply) => {
    const { id } = request.params as any;
    const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    return result.rows[0] || { error: 'Order not found' };
  });

  fastify.get('/api/orders', async (request, reply) => {
    const result = await pool.query('SELECT * FROM orders ');
    return result.rows;
  });
}