import WebSocket from 'ws';
import axios from 'axios';

async function testOrders(count = 1) {
  for (let i = 0; i < count; i++) {
    const response = await axios.post('http://localhost:3000/api/orders/execute', {
      tokenIn: 'SOL',
      tokenOut: 'USDC',
      amountIn: 100,
      slippage: 0.01
    });
    const { orderId } = response.data;

    const ws = new WebSocket(`ws://localhost:3000/ws/orders/${orderId}`);
    ws.on('message', (data) => {
      console.log(`Order ${orderId}:`, JSON.parse(data));
    });
  }
}

testOrders(process.argv[2] || 1);