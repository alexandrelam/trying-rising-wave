# RisingWave Streaming Pipeline

A real-time streaming pipeline: **Kafka → RisingWave → Materialized Views**, with a FastAPI backend and React frontend dashboard. The domain models practitioners and their specialities.

## Architecture

```
┌──────────┐    ┌───────────┐    ┌─────────────┐
│  Frontend │───▶│  Backend   │───▶│    Kafka     │
│  (React)  │◀──│  (FastAPI) │    └──────┬──────┘
└──────────┘    └─────┬─────┘           │
                      │           ┌──────▼──────┐
                      └──────────▶│  RisingWave  │
                        query     │  (MVs + SQL) │
                                  └─────────────┘
```

- **Frontend** — React + TypeScript (Vite, Tailwind v4, shadcn/ui)
- **Backend** — FastAPI with SSE for real-time updates
- **Kafka** — Message broker (KRaft mode, no ZooKeeper)
- **RisingWave** — Streaming database with materialized views
- **PostgreSQL** — Metadata store for RisingWave

## Local Development

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- [uv](https://docs.astral.sh/uv/) (Python package manager)
- [pnpm](https://pnpm.io/) (Node package manager)
- Python >= 3.11
- Node >= 18

### 1. Start infrastructure

```bash
docker compose up -d
```

This starts Kafka, PostgreSQL, and RisingWave.

### 2. Start the backend

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload
```

The API runs at http://localhost:3007.

### 3. Start the frontend

```bash
cd web
pnpm install
pnpm dev
```

The dev server runs at http://localhost:5173.

### 4. Use the app

1. Open http://localhost:5173
2. Click **Setup Pipeline** to create Kafka topics, RisingWave sources, and materialized views
3. Click **Seed** to populate sample data
4. Watch data flow in real-time via SSE

### Service ports (dev)

| Service              | Port  |
|----------------------|-------|
| Kafka (host)         | 29092 |
| PostgreSQL (metadata)| 8432  |
| RisingWave SQL       | 4566  |
| RisingWave dashboard | 5691  |
| Backend API          | 3007  |
| Frontend dev server  | 5173  |

### Experiments (standalone scripts)

```bash
uv sync
uv run experiments/kafka_risingwave/main.py    # run full pipeline
uv run experiments/kafka_risingwave/reset.py   # reset state
```

### Connect to RisingWave directly

```bash
psql -h localhost -p 4566 -U root -d dev
```

## Production Deployment

Deploy the full stack on a single VPS with Docker Compose. Nginx serves the frontend and reverse-proxies API requests.

### Prerequisites

- A VPS with >= 4GB RAM
- Docker and Docker Compose installed
- The repo cloned on the server

### Deploy

```bash
git clone <repo-url> && cd rising-wave
./deploy.sh
```

Or manually:

```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

The app is available at `http://<your-server-ip>` on port 80.

### What `docker-compose.prod.yml` does

- Runs all services (Kafka, PostgreSQL, RisingWave, backend, frontend) in a single compose stack
- Only port **80** is exposed (Nginx serves frontend + proxies `/api` to the backend)
- RisingWave memory is capped at 2GB for small VPS environments
- All inter-service communication uses Docker's internal network

### Environment variables (backend)

| Variable                  | Default          | Description                    |
|---------------------------|------------------|--------------------------------|
| `RW_HOST`                 | `localhost`      | RisingWave hostname            |
| `RW_PORT`                 | `4566`           | RisingWave port                |
| `KAFKA_BOOTSTRAP_SERVERS` | `localhost:29092`| Kafka bootstrap servers        |
| `CORS_ORIGINS`            | `*`              | Comma-separated allowed origins|

### Frontend build-time variables

| Variable        | Default | Description  |
|-----------------|---------|--------------|
| `VITE_API_BASE` | `/api`  | API base URL |

## Data Model

**`practitioners` topic**
```json
{ "id": 1, "name": "Dr. Smith", "email": "smith@example.com" }
```

**`specialities` topic**
```json
{ "id": 1, "name": "Cardiology" }
```

Practitioners reference specialities via a join. RisingWave maintains a `practitioners_with_specialities` materialized view that aggregates specialities as a JSONB array.
