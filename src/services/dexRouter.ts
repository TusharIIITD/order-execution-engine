import  { DexQuote, SwapResult, Order } from '../types/index.js';

export class DexRouter {
  private basePrices = {
    'SOL-USDC': 145.0,
    'USDC-SOL': 1 / 145.0,
  };

  async getQuotes(tokenIn: string, tokenOut: string, amount: number): Promise<DexQuote[]> {
    const pair = `${tokenIn}-${tokenOut}`;
    const basePrice = this.basePrices[pair as keyof typeof this.basePrices] || 1.0;

    // Simulate Raydium quote (2-5% variance, 0.3% fee)
    await this.sleep(200);
    const raydiumPrice = basePrice * (0.98 + Math.random() * 0.04);
    const raydiumOutput = amount * raydiumPrice * (1 - 0.003);
    const raydium: DexQuote = {
      dex: 'raydium',
      price: raydiumPrice,
      output: raydiumOutput,
      liquidity: 80 + Math.random() * 20,
      fee: 0.003,
    };

    // Simulate Meteora quote (2-5% variance, 0.2% fee)
    await this.sleep(200);
    const meteoraPrice = basePrice * (0.97 + Math.random() * 0.05);
    const meteoraOutput = amount * meteoraPrice * (1 - 0.002);
    const meteora: DexQuote = {
      dex: 'meteora',
      price: meteoraPrice,
      output: meteoraOutput,
      liquidity: 75 + Math.random() * 25,
      fee: 0.002,
    };

    return [raydium, meteora];
  }

  selectBestQuote(quotes: DexQuote[]): DexQuote {
    // Score: output * liquidity / (1 + fee)
    const scored = quotes.map(q => ({
      ...q,
      score: q.output * q.liquidity / (1 + q.fee),
    }));
    return scored.reduce((best, curr) => curr.score > best.score ? curr : best);
  }

  async executeSwap(dex: string, order: Order): Promise<SwapResult> {
    // Simulate 2-3s execution, 5% failure rate
    await this.sleep(2000 + Math.random() * 1000);
    if (Math.random() < 0.05) throw new Error('DEX execution failed');

    const output = order.amountIn * (this.basePrices[`${order.tokenIn}-${order.tokenOut}` as keyof typeof this.basePrices] || 1.0) * (1 - 0.01); // Simulate slippage
    return {
      txHash: `mock-${dex}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      executedPrice: output / order.amountIn,
      output,
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}