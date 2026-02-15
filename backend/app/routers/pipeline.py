from fastapi import APIRouter

from app.db import get_conn, query_rows
from app.kafka import create_topics, delete_topics, produce_message

router = APIRouter()

SOURCES_SQL = [
    """
    CREATE TABLE IF NOT EXISTS practitioners_source (id INT, name VARCHAR, email VARCHAR, PRIMARY KEY (rw_key))
    INCLUDE key AS rw_key
    WITH (connector='kafka', topic='practitioners', properties.bootstrap.server='kafka:9092')
    FORMAT UPSERT ENCODE JSON
    """,
    """
    CREATE SOURCE IF NOT EXISTS specialities_source (practitioner_id INT, speciality VARCHAR)
    WITH (connector='kafka', topic='specialities', properties.bootstrap.server='kafka:9092')
    FORMAT PLAIN ENCODE JSON
    """,
]

MVS_SQL = [
    "CREATE MATERIALIZED VIEW IF NOT EXISTS practitioners_mv AS SELECT id, name, email FROM practitioners_source",
    "CREATE MATERIALIZED VIEW IF NOT EXISTS specialities_mv AS SELECT * FROM specialities_source",
    """
    CREATE MATERIALIZED VIEW IF NOT EXISTS practitioners_with_specialities AS
    SELECT p.id, p.name, p.email, jsonb_agg(s.speciality ORDER BY s.speciality) AS specialities
    FROM practitioners_mv p
    JOIN specialities_mv s ON p.id = s.practitioner_id
    GROUP BY p.id, p.name, p.email
    """,
]

DROP_SQL = [
    "DROP MATERIALIZED VIEW IF EXISTS practitioners_with_specialities CASCADE",
    "DROP MATERIALIZED VIEW IF EXISTS practitioners_mv CASCADE",
    "DROP MATERIALIZED VIEW IF EXISTS specialities_mv CASCADE",
    "DROP TABLE IF EXISTS practitioners_source CASCADE",
    "DROP SOURCE IF EXISTS practitioners_source CASCADE",
    "DROP SOURCE IF EXISTS specialities_source CASCADE",
]


@router.post("/setup")
def setup_pipeline():
    create_topics(["practitioners"], config={"cleanup.policy": "compact"})
    create_topics(["specialities"])
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


SEED_PRACTITIONERS = [
    {"id": 1, "name": "Alice Smith", "email": "alice@example.com"},
    {"id": 2, "name": "Bob Johnson", "email": "bob@example.com"},
    {"id": 3, "name": "Carol Williams", "email": "carol@example.com"},
    {"id": 4, "name": "David Brown", "email": "david@example.com"},
    {"id": 5, "name": "Eve Davis", "email": "eve@example.com"},
]

SEED_SPECIALITIES = [
    {"practitioner_id": 1, "speciality": "Cardiology"},
    {"practitioner_id": 1, "speciality": "Internal Medicine"},
    {"practitioner_id": 2, "speciality": "Dermatology"},
    {"practitioner_id": 3, "speciality": "Neurology"},
    {"practitioner_id": 3, "speciality": "Psychiatry"},
    {"practitioner_id": 4, "speciality": "Orthopedics"},
    {"practitioner_id": 5, "speciality": "Pediatrics"},
    {"practitioner_id": 5, "speciality": "Cardiology"},
]


@router.post("/seed")
def seed_pipeline():
    for p in SEED_PRACTITIONERS:
        produce_message("practitioners", str(p["id"]), p)
    for s in SEED_SPECIALITIES:
        produce_message("specialities", str(s["practitioner_id"]), s)
    return {
        "status": "ok",
        "message": f"Seeded {len(SEED_PRACTITIONERS)} practitioners and {len(SEED_SPECIALITIES)} specialities",
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
    return query_rows("SELECT id, name, email FROM practitioners_source")


@router.get("/sources/specialities")
def source_specialities():
    return query_rows("SELECT * FROM specialities_source")


@router.get("/views/practitioners")
def view_practitioners():
    return query_rows("SELECT * FROM practitioners_mv ORDER BY id")


@router.get("/views/specialities")
def view_specialities():
    return query_rows("SELECT * FROM specialities_mv ORDER BY practitioner_id")


@router.get("/views/joined")
def view_joined():
    return query_rows(
        "SELECT id, name, email, specialities FROM practitioners_with_specialities ORDER BY id"
    )
