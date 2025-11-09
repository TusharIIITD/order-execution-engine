import { DexRouter } from '../src/services/dexRouter.js';

describe('DexRouter', () => {
  const router = new DexRouter();

  test('getQuotes returns valid quotes', async () => {
    const quotes = await router.getQuotes('SOL', 'USDC', 100);
    expect(quotes).toHaveLength(2);
    quotes.forEach(q => {
      expect(q.dex).toMatch(/raydium|meteora/);
      expect(q.price).toBeGreaterThan(0);
      expect(q.output).toBeGreaterThan(0);
    });
  });

  test('selectBestQuote picks highest scoring quote', async () => {
    const quotes = [
      { dex: 'raydium', price: 145, output: 14000, liquidity: 80, fee: 0.003 },
      { dex: 'meteora', price: 146, output: 14500, liquidity: 85, fee: 0.002 },
    ];
    const best = router.selectBestQuote(quotes);
    expect(best.dex).toBe('meteora');
  });

  test('executeSwap succeeds most times', async () => {
    const order = { id: 'test', tokenIn: 'SOL', tokenOut: 'USDC', amountIn: 100, slippage: 0.01, status: 'pending' as const, createdAt: new Date(), updatedAt: new Date() };
    const result = await router.executeSwap('raydium', order);
    expect(result.txHash).toContain('mock-raydium');
    expect(result.executedPrice).toBeGreaterThan(0);
  });
});