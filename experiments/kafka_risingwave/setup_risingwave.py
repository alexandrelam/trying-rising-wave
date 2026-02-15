import psycopg2


SOURCES = [
    """
    CREATE TABLE IF NOT EXISTS practitioners_source (id INT, name VARCHAR, email VARCHAR, created_at TIMESTAMPTZ, PRIMARY KEY (rw_key))
    INCLUDE key AS rw_key
    WITH (connector='kafka', topic='practitioners', properties.bootstrap.server='kafka:9092')
    FORMAT UPSERT ENCODE JSON
    """,
    """
    CREATE SOURCE IF NOT EXISTS specialities_source (practitioner_id INT, speciality VARCHAR, created_at TIMESTAMPTZ)
    WITH (connector='kafka', topic='specialities', properties.bootstrap.server='kafka:9092')
    FORMAT PLAIN ENCODE JSON
    """,
]

MATERIALIZED_VIEWS = [
    "CREATE MATERIALIZED VIEW IF NOT EXISTS practitioners_mv AS SELECT id, name, email, created_at FROM practitioners_source",
    "CREATE MATERIALIZED VIEW IF NOT EXISTS specialities_mv AS SELECT * FROM specialities_source",
    """
    CREATE MATERIALIZED VIEW IF NOT EXISTS practitioners_with_specialities AS
    SELECT p.id, p.name, p.email, jsonb_agg(s.speciality ORDER BY s.speciality) AS specialities, max(p.created_at) AS created_at
    FROM practitioners_mv p
    JOIN specialities_mv s ON p.id = s.practitioner_id
    GROUP BY p.id, p.name, p.email
    """,
]


def setup():
    conn = psycopg2.connect(host="localhost", port=4566, user="root", dbname="dev")
    conn.autocommit = True
    cur = conn.cursor()

    print("Creating Kafka sources...")
    for sql in SOURCES:
        cur.execute(sql)
    print("  Sources created")

    print("Creating materialized views...")
    for sql in MATERIALIZED_VIEWS:
        cur.execute(sql)
    print("  Materialized views created")

    cur.close()
    conn.close()


if __name__ == "__main__":
    setup()
