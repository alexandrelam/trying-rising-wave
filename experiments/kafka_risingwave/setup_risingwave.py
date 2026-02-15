import psycopg2


SOURCES = [
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

MATERIALIZED_VIEWS = [
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
