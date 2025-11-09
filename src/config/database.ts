import { Pool } from 'pg';
import { Redis } from 'ioredis';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL must be set in the environment.');
}
const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export { pool, redis };