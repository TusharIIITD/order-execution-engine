export interface Order {
  id: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  amountOut?: number;
  slippage: number;
  status: 'pending' | 'routing' | 'building' | 'submitted' | 'confirmed' | 'failed';
  txHash?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DexQuote {
  dex: string;
  price: number;
  output: number;
  liquidity: number;
  fee: number;
}

export interface SwapResult {
  txHash: string;
  executedPrice: number;
  output: number;
}