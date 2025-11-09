# Order Execution Engine (mock)

A lightweight mock order execution engine built with Fastify, BullMQ (Redis-backed queue), and PostgreSQL. It simulates DEX routing and swap execution for demonstration and local development.

This repository includes:
- HTTP API to create and query orders (`/api/orders`)
- WebSocket endpoints for per-order real-time updates (`/ws/orders/:orderId`)
- A worker that executes queued orders using a simulated DEX router
- Example client in `examples/websocket-client.js`

## Features
- Queue-based order processing with concurrency and rate limiting (BullMQ)
- Simulated multi-DEX quoting and selection
- Order lifecycle: pending → routing → building → submitted → confirmed | failed
- Persistent order storage in PostgreSQL
- Real-time status updates over WebSocket

## Quick contract (what this README explains)
- Inputs: HTTP POST /api/orders/execute JSON body with tokenIn, tokenOut, amountIn, optional slippage
- Outputs: Creates an `orders` DB row and returns `orderId`. Status updates are pushed to connected WebSocket clients for that orderId.
- Error modes: validation errors (400), worker failures update DB status to `failed` and broadcast an error message

## Prerequisites
- Node.js (16+ recommended)
- PostgreSQL
- Redis
- Yarn or npm

Environment variables (required):
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `PORT` - optional (defaults to 3000)

## Installation (local)
Open PowerShell and run:

```powershell
# from repo root
npm install

```

Create a `.env` file at the project root or set the environment variables in your shell. Example `.env`:

```
DATABASE_URL=postgres://user:password@localhost:5432/order_db
REDIS_URL=redis://localhost:6379
PORT=3000
```

## Database
This project expects an `orders` table. For quick local testing, create a simple table:

```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  token_in TEXT,
  token_out TEXT,
  amount_in NUMERIC,
  amount_out NUMERIC,
  slippage NUMERIC,
  status TEXT,
  tx_hash TEXT,
  error TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

Adjust types and migrations as needed for production.

## Running the app
Start Redis and Postgres (locally or via Docker). This repo includes `docker-compose.yml` and `Dockerfile` if you prefer containers.

Run the server (PowerShell):

```powershell
# ensure env vars are set
npm run dev
# or (if no dev script) run
node --loader ts-node/esm src/server.ts
```

If using Docker Compose (if `docker-compose.yml` is configured to run the app and its dependencies):

```powershell
docker-compose up --build
```

## API Endpoints
- POST `/api/orders/execute`
  - Body (JSON): { tokenIn: string, tokenOut: string, amountIn: number, slippage?: number }
  - Response: { orderId: string }
  - Side effect: creates DB order row and enqueues a job for execution

- GET `/api/orders/:id` - returns order details
- GET `/api/orders` - returns all orders
- GET `/health` - returns { status: 'ok' }

## WebSocket (status updates)
After creating an order with `/api/orders/execute`, connect to the WebSocket for that order:

WebSocket URL (example):

```
ws://localhost:3000/ws/orders/<orderId>
```
When connected, the server broadcasts status updates for that order. The client in `examples/websocket-client.js` demonstrates creating an order via HTTP and listening via WebSocket.

### Example (curl + node client)
Create an order with curl (PowerShell):

```powershell
$body = @{ tokenIn = 'SOL'; tokenOut = 'USDC'; amountIn = 100; slippage = 0.01 } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3000/api/orders/execute -Method Post -Body $body -ContentType 'application/json'
```

Or use the included example (requires `axios` and `ws`):

```powershell
node examples\websocket-client.js 1
```

This script posts a new order and opens a WebSocket to print status messages.

## Testing
This repo includes Jest config (`jest.config.js`). Run tests with:

```powershell
npm test
```

Adjust or add unit tests under `tests/` as needed.

## Development notes
- Queue is implemented in `src/services/orderQueue.ts` using BullMQ. Worker concurrency and limiting are configured there.
- Core order flow is in `src/services/orderExecutor.ts` and the simulated DEX is `src/services/dexRouter.ts`.
- WebSocket manager is in `src/utils/websocket.ts`. The server mounts a WS route at `/ws/orders/:orderId` in `src/server.ts`.

