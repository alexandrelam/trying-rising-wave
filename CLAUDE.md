# CLAUDE.md

## Language & Tools

- Use Python for all code in this project.
- Use `uv` to install dependencies and run the program.
  - Install dependencies: `uv sync`
  - Run the program: `uv run experiments/kafka_risingwave/main.py`

## Docker Stack

- Start services: `docker compose up -d`
- Services:
  - **Kafka** (`apache/kafka:latest`) — KRaft mode, no ZooKeeper. Internal port `9092`, host port `29092`.
  - **PostgreSQL 17** (`postgres:17-alpine`) — metadata store for RisingWave. Port `8432`.
  - **RisingWave v2.7.1** — standalone mode, in-memory state store (`hummock+memory`). SQL frontend on port `4566`, dashboard on port `5691`.
- Connect to RisingWave: `psql -h localhost -p 4566 -U root -d dev`
- Reset state (drop views/sources, delete Kafka topics): `uv run experiments/kafka_risingwave/reset.py`

## Experiments

### `experiments/kafka_risingwave/`
POC that streams practitioner and speciality data through Kafka into RisingWave, then queries a materialized view that joins practitioners with their specialities in real time. Demonstrates Kafka sources, materialized views, and streaming joins in RisingWave.
