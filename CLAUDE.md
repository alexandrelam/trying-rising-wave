# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A real-time streaming pipeline that flows: **Kafka → RisingWave → Materialized Views**, with a FastAPI backend and React frontend dashboard for visualization. The domain models practitioners and their specialities.

## Architecture

Three separate components, each with its own dependency management:

- **`experiments/kafka_risingwave/`** — Standalone Python scripts (POC). Uses root `pyproject.toml` (Python ≥3.14). Streams practitioner/speciality data through Kafka into RisingWave, creates materialized views with streaming joins.
- **`backend/`** — FastAPI API server. Has its own `pyproject.toml` (Python ≥3.11). Routers: `practitioners`, `specialities`, `pipeline`, `events` (SSE). Talks to Kafka (produce) and RisingWave (query via psycopg2).
- **`web/`** — React + TypeScript frontend (Vite, Tailwind v4, shadcn/ui). Communicates with backend at `localhost:8000`. Key components: `PipelineView`, `DataTable`, `ProducerForms`, `PipelineControls`.

## Commands

### Docker Stack
- Start services: `docker compose up -d`
- Connect to RisingWave: `psql -h localhost -p 4566 -U root -d dev`

### Services (ports)
| Service | Port |
|---------|------|
| Kafka (host) | 29092 |
| PostgreSQL (metadata) | 8432 |
| RisingWave SQL | 4566 |
| RisingWave dashboard | 5691 |
| Backend API | 8000 |
| Frontend dev | 5173 |

### Experiments (root project)
```bash
uv sync                                          # install deps
uv run experiments/kafka_risingwave/main.py       # run full pipeline
uv run experiments/kafka_risingwave/reset.py      # reset state (drop views/sources, delete topics)
```

### Backend
```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload
```

### Frontend
```bash
cd web
pnpm install
pnpm dev        # dev server
pnpm build      # production build
pnpm lint       # eslint
```

## Language & Tools
- Use Python for backend/experiment code.
- Use `uv` for Python dependency management and running scripts.
- Use `pnpm` for frontend.
