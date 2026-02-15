import psycopg2


SOURCES = [
    """
    CREATE SOURCE IF NOT EXISTS practitioners_source (id INT, name VARCHAR, email VARCHAR)
    WITH (connector='kafka', topic='practitioners', properties.bootstrap.server='localhost:9092')
    FORMAT PLAIN ENCODE JSON
    """,
    """
    CREATE SOURCE IF NOT EXISTS specialities_source (practitioner_id INT, speciality VARCHAR)
    WITH (connector='kafka', topic='specialities', properties.bootstrap.server='localhost:9092')
    FORMAT PLAIN ENCODE JSON
    """,
]

MATERIALIZED_VIEWS = [
    "CREATE MATERIALIZED VIEW IF NOT EXISTS practitioners_mv AS SELECT * FROM practitioners_source",
    "CREATE MATERIALIZED VIEW IF NOT EXISTS specialities_mv AS SELECT * FROM specialities_source",
    """
    CREATE MATERIALIZED VIEW IF NOT EXISTS practitioners_with_specialities AS
    SELECT p.id, p.name, p.email, s.speciality
    FROM practitioners_mv p
    JOIN specialities_mv s ON p.id = s.practitioner_id
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
