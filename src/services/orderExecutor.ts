import { Order, DexQuote } from '../types/index.js';
import { DexRouter } from './dexRouter.js';
import { pool } from '../config/database.js';
import { WebSocketManager } from '../utils/websocket.js';

export class OrderExecutor {
  private dexRouter = new DexRouter();
  private wsManager = WebSocketManager.getInstance();

  async executeOrder(order: Order): Promise<void> {
    try {
      // Update status to routing
      await this.updateOrderStatus(order.id, 'routing');
      this.wsManager.broadcast(order.id, { status: 'routing', message: 'Best route found' });

      // Get quotes and select best
      const quotes = await this.dexRouter.getQuotes(order.tokenIn, order.tokenOut, order.amountIn);
      const bestQuote = this.dexRouter.selectBestQuote(quotes);
      console.log(`[DEX Router] Selected ${bestQuote.dex} (score: ${bestQuote.output * bestQuote.liquidity / (1 + bestQuote.fee)})`);

      // Update status to building
      await this.updateOrderStatus(order.id, 'building');
      this.wsManager.broadcast(order.id, { status: 'building', message: 'Building transaction' });

      // Execute swap
      const result = await this.dexRouter.executeSwap(bestQuote.dex, order);
      order.amountOut = result.output;
      order.txHash = result.txHash;

      // Update status to submitted
      await this.updateOrderStatus(order.id, 'submitted');
      this.wsManager.broadcast(order.id, { status: 'submitted', message: 'Transaction submitted' });

      // Simulate confirmation (in real impl, poll Solana)
      await this.sleep(10);
      await this.updateOrderStatus(order.id, 'confirmed');
      this.wsManager.broadcast(order.id, { status: 'confirmed', message: 'Order completed!', txHash: order.txHash });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Order ${order.id} failed:`, errorMessage);
      await this.updateOrderStatus(order.id, 'failed', errorMessage);
      this.wsManager.broadcast(order.id, { status: 'failed', error: errorMessage });
    }
  }

  private async updateOrderStatus(id: string, status: Order['status'], error?: string): Promise<void> {
    await pool.query(
      'UPDATE orders SET status = $1, error = $2, updated_at = NOW() WHERE id = $3',
      [status, error, id]
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}