import json
from confluent_kafka import Producer
from confluent_kafka.admin import AdminClient

BOOTSTRAP_SERVERS = "localhost:29092"

_producer = None


def get_producer() -> Producer:
    global _producer
    if _producer is None:
        _producer = Producer({"bootstrap.servers": BOOTSTRAP_SERVERS})
    return _producer


def produce_message(topic: str, key: str, value: dict):
    producer = get_producer()
    producer.produce(topic, key=key, value=json.dumps(value))
    producer.flush()


def get_admin() -> AdminClient:
    return AdminClient({"bootstrap.servers": BOOTSTRAP_SERVERS})


def delete_topics(topics: list[str]):
    admin = get_admin()
    futures = admin.delete_topics(topics)
    for topic, future in futures.items():
        try:
            future.result()
        except Exception:
            pass
