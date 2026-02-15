from fastapi import APIRouter

from app.db import get_conn, query_rows
from app.kafka import delete_topics

router = APIRouter()

SOURCES_SQL = [
    """
    CREATE SOURCE IF NOT EXISTS practitioners_source (id INT, name VARCHAR, email VARCHAR)
    WITH (connector='kafka', topic='practitioners', properties.bootstrap.server='kafka:9092')
    FORMAT PLAIN ENCODE JSON
    """,
    """
    CREATE SOURCE IF NOT EXISTS specialities_source (practitioner_id INT, speciality VARCHAR)
    WITH (connector='kafka', topic='specialities', properties.bootstrap.server='kafka:9092')
    FORMAT PLAIN ENCODE JSON
    """,
]

MVS_SQL = [
    "CREATE MATERIALIZED VIEW IF NOT EXISTS practitioners_mv AS SELECT * FROM practitioners_source",
    "CREATE MATERIALIZED VIEW IF NOT EXISTS specialities_mv AS SELECT * FROM specialities_source",
    """
    CREATE MATERIALIZED VIEW IF NOT EXISTS practitioners_with_specialities AS
    SELECT p.id, p.name, p.email, s.speciality
    FROM practitioners_mv p
    JOIN specialities_mv s ON p.id = s.practitioner_id
    """,
]

DROP_SQL = [
    "DROP MATERIALIZED VIEW IF EXISTS practitioners_with_specialities CASCADE",
    "DROP MATERIALIZED VIEW IF EXISTS practitioners_mv CASCADE",
    "DROP MATERIALIZED VIEW IF EXISTS specialities_mv CASCADE",
    "DROP SOURCE IF EXISTS practitioners_source CASCADE",
    "DROP SOURCE IF EXISTS specialities_source CASCADE",
]


@router.post("/setup")
def setup_pipeline():
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
    return query_rows("SELECT * FROM practitioners_source")


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
        "SELECT id, name, email, speciality FROM practitioners_with_specialities ORDER BY id, speciality"
    )
