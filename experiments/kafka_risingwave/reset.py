import psycopg2
from confluent_kafka.admin import AdminClient


def reset():
    # Drop RisingWave objects in dependency order
    print("Dropping RisingWave objects...")
    conn = psycopg2.connect(host="localhost", port=4566, user="root", dbname="dev")
    conn.autocommit = True
    cur = conn.cursor()

    statements = [
        "DROP MATERIALIZED VIEW IF EXISTS practitioners_with_specialities CASCADE",
        "DROP MATERIALIZED VIEW IF EXISTS practitioners_mv CASCADE",
        "DROP MATERIALIZED VIEW IF EXISTS specialities_mv CASCADE",
        "DROP SOURCE IF EXISTS practitioners_source CASCADE",
        "DROP SOURCE IF EXISTS specialities_source CASCADE",
    ]
    for stmt in statements:
        print(f"  {stmt}")
        cur.execute(stmt)

    cur.close()
    conn.close()
    print("Done.\n")

    # Delete Kafka topics
    print("Deleting Kafka topics...")
    admin = AdminClient({"bootstrap.servers": "localhost:29092"})
    topics = ["practitioners", "specialities"]
    futures = admin.delete_topics(topics)
    for topic, future in futures.items():
        try:
            future.result()
            print(f"  Deleted topic: {topic}")
        except Exception as e:
            print(f"  Topic {topic}: {e}")
    print("Done.")


if __name__ == "__main__":
    reset()
