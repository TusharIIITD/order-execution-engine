import { Queue, Worker } from 'bullmq';
import { OrderExecutor } from './orderExecutor.js';

const orderQueue = new Queue('orders', {
  connection: {
    url: process.env.REDIS_URL as string,
    maxRetriesPerRequest: null,
  },
});

const worker = new Worker('orders', async (job) => {
    const executor = new OrderExecutor();
    await executor.executeOrder(job.data);
}, {
    connection: {
      url: process.env.REDIS_URL as string,
      maxRetriesPerRequest: null,
    },
    concurrency: 10, // Up to 10 concurrent orders
    limiter: { max: 100, duration: 60000 }, // 100 orders/min
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);
});

export { orderQueue };