# Kafka + RisingWave POC — Practitioners & Specialities

A learning project to understand RisingWave's streaming SQL capabilities. We produce data to Kafka topics, then use RisingWave to join them via materialized views in real time.

## Goal

Demonstrate how RisingWave can consume Kafka topics and maintain incrementally updated materialized views, including joins across multiple streams — without writing any stream processing code.

## Data Model

**`practitioners` topic**

```json
{ "id": 1, "name": "Dr. Smith", "email": "smith@example.com" }
```

**`specialities` topic** (many per practitioner)

```json
{ "practitioner_id": 1, "speciality": "Cardiology" }
```

## Files

| File | Description |
|---|---|
| `produce.py` | Produces sample practitioners and specialities to Kafka topics using `confluent-kafka`. |
| `setup_risingwave.py` | Connects to RisingWave and creates Kafka sources, base materialized views, and a joined `practitioners_with_specialities` view. |
| `query.py` | Queries the joined materialized view and pretty-prints the results. |
| `main.py` | Orchestrator — runs produce → setup → wait → query in sequence. |

## How to Run

1. Start the Docker stack:

   ```sh
   docker compose up -d
   ```

2. Install Python dependencies:

   ```sh
   uv sync
   ```

3. Run the full pipeline:

   ```sh
   uv run main.py
   ```

   This will produce data to Kafka, set up RisingWave sources and materialized views, wait for processing, then print the joined results.

You can also run each step individually:

```sh
uv run produce.py          # produce data to Kafka
uv run setup_risingwave.py # create sources and materialized views
uv run query.py            # query the joined view
```

## RisingWave Materialized Views

The setup creates the following objects:

- **`practitioners_source`** — Kafka source reading from the `practitioners` topic
- **`specialities_source`** — Kafka source reading from the `specialities` topic
- **`practitioners_mv`** — Materialized view over practitioners
- **`specialities_mv`** — Materialized view over specialities
- **`practitioners_with_specialities`** — Joined materialized view combining practitioners with their specialities

You can also query RisingWave directly:

```sh
psql -h localhost -p 4566 -U root -d dev
```

```sql
SELECT * FROM practitioners_with_specialities ORDER BY id, speciality;
```
