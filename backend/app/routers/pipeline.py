from fastapi import APIRouter

from app.db import get_conn, query_rows
from app.kafka import create_topics, delete_topics, produce_message

router = APIRouter()

SOURCES_SQL = [
    """
    CREATE TABLE IF NOT EXISTS specialities_source (id INT, name VARCHAR, created_at TIMESTAMPTZ, PRIMARY KEY (rw_key))
    INCLUDE key AS rw_key
    WITH (connector='kafka', topic='specialities', properties.bootstrap.server='kafka:9092')
    FORMAT UPSERT ENCODE JSON
    """,
    """
    CREATE TABLE IF NOT EXISTS practitioners_source (id INT, name VARCHAR, email VARCHAR, speciality_ids JSONB, created_at TIMESTAMPTZ, PRIMARY KEY (rw_key))
    INCLUDE key AS rw_key
    WITH (connector='kafka', topic='practitioners', properties.bootstrap.server='kafka:9092')
    FORMAT UPSERT ENCODE JSON
    """,
]

MVS_SQL = [
    "CREATE MATERIALIZED VIEW IF NOT EXISTS practitioners_mv AS SELECT id, name, email, speciality_ids, created_at FROM practitioners_source",
    "CREATE MATERIALIZED VIEW IF NOT EXISTS specialities_mv AS SELECT id, name FROM specialities_source",
    """
    CREATE MATERIALIZED VIEW IF NOT EXISTS practitioners_speciality_unnest AS
    SELECT id, name, email, (elem)::int AS speciality_id, created_at
    FROM practitioners_source, jsonb_array_elements(speciality_ids) AS elem
    """,
    """
    CREATE MATERIALIZED VIEW IF NOT EXISTS practitioners_with_specialities AS
    SELECT p.id, p.name, p.email,
           jsonb_agg(s.name ORDER BY s.name) AS specialities,
           max(p.created_at) AS created_at
    FROM practitioners_speciality_unnest p
    JOIN specialities_mv s ON s.id = p.speciality_id
    GROUP BY p.id, p.name, p.email
    """,
]

DROP_SQL = [
    "DROP MATERIALIZED VIEW IF EXISTS practitioners_with_specialities CASCADE",
    "DROP MATERIALIZED VIEW IF EXISTS practitioners_speciality_unnest CASCADE",
    "DROP MATERIALIZED VIEW IF EXISTS practitioners_mv CASCADE",
    "DROP MATERIALIZED VIEW IF EXISTS specialities_mv CASCADE",
    "DROP TABLE IF EXISTS practitioners_source CASCADE",
    "DROP TABLE IF EXISTS specialities_source CASCADE",
    "DROP SOURCE IF EXISTS practitioners_source CASCADE",
    "DROP SOURCE IF EXISTS specialities_source CASCADE",
]


@router.post("/setup")
def setup_pipeline():
    create_topics(["practitioners"], config={"cleanup.policy": "compact"})
    create_topics(["specialities"], config={"cleanup.policy": "compact"})
    conn = get_conn()
    cur = conn.cursor()
    for sql in SOURCES_SQL + MVS_SQL:
        cur.execute(sql)
    cur.close()
    conn.close()
    return {"status": "ok", "message": "Sources and materialized views created"}


@router.post("/reset")
def reset_pipeline():
    conn = get_conn()
    cur = conn.cursor()
    for sql in DROP_SQL:
        cur.execute(sql)
    cur.close()
    conn.close()
    delete_topics(["practitioners", "specialities"])
    return {"status": "ok", "message": "Pipeline reset complete"}


SEED_SPECIALITIES = [
    {"id": 1, "name": "Cardiology"},
    {"id": 2, "name": "Internal Medicine"},
    {"id": 3, "name": "Dermatology"},
    {"id": 4, "name": "Neurology"},
    {"id": 5, "name": "Psychiatry"},
    {"id": 6, "name": "Orthopedics"},
    {"id": 7, "name": "Pediatrics"},
]

SEED_PRACTITIONERS = [
    {"id": 1, "name": "Alice Smith", "email": "alice@example.com", "speciality_ids": [1, 2]},
    {"id": 2, "name": "Bob Johnson", "email": "bob@example.com", "speciality_ids": [3]},
    {"id": 3, "name": "Carol Williams", "email": "carol@example.com", "speciality_ids": [4, 5]},
    {"id": 4, "name": "David Brown", "email": "david@example.com", "speciality_ids": [6]},
    {"id": 5, "name": "Eve Davis", "email": "eve@example.com", "speciality_ids": [1, 7]},
]


@router.post("/seed")
def seed_pipeline():
    for s in SEED_SPECIALITIES:
        produce_message("specialities", str(s["id"]), s)
    for p in SEED_PRACTITIONERS:
        produce_message("practitioners", str(p["id"]), p)
    return {
        "status": "ok",
        "message": f"Seeded {len(SEED_SPECIALITIES)} specialities and {len(SEED_PRACTITIONERS)} practitioners",
    }


@router.get("/status")
def pipeline_status():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT name FROM rw_sources")
    sources = [row[0] for row in cur.fetchall()]
    cur.execute("SELECT name FROM rw_materialized_views")
    views = [row[0] for row in cur.fetchall()]
    cur.close()
    conn.close()
    return {"sources": sources, "materialized_views": views}


@router.get("/sources/practitioners")
def source_practitioners():
    return query_rows("SELECT id, name, email, speciality_ids, created_at FROM practitioners_source")


@router.get("/sources/specialities")
def source_specialities():
    return query_rows("SELECT id, name, created_at FROM specialities_source")


@router.get("/views/practitioners")
def view_practitioners():
    return query_rows("SELECT id, name, email, speciality_ids, created_at FROM practitioners_mv ORDER BY created_at DESC")


@router.get("/views/specialities")
def view_specialities():
    return query_rows("SELECT id, name FROM specialities_mv ORDER BY id DESC")


@router.get("/views/joined")
def view_joined():
    return query_rows(
        "SELECT id, name, email, specialities, created_at FROM practitioners_with_specialities ORDER BY created_at DESC"
    )
