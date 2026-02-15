import json
import os
from datetime import datetime, timezone
from confluent_kafka import Producer
from confluent_kafka.admin import AdminClient, NewTopic

from app.event_log import log_event

BOOTSTRAP_SERVERS = os.environ.get("KAFKA_BOOTSTRAP_SERVERS", "localhost:29092")

_producer = None


def get_producer() -> Producer:
    global _producer
    if _producer is None:
        _producer = Producer({"bootstrap.servers": BOOTSTRAP_SERVERS})
    return _producer


def produce_message(topic: str, key: str, value: dict):
    producer = get_producer()
    value = {**value, "created_at": datetime.now(timezone.utc).isoformat()}
    producer.produce(topic, key=key.encode(), value=json.dumps(value).encode())
    producer.flush()
    log_event("INSERT", topic, key, value)


def produce_tombstone(topic: str, key: str):
    producer = get_producer()
    producer.produce(topic, key=key.encode(), value=None)
    producer.flush()
    log_event("TOMBSTONE", topic, key, None)


def get_admin() -> AdminClient:
    return AdminClient({"bootstrap.servers": BOOTSTRAP_SERVERS})


def create_topics(topics: list[str], num_partitions: int = 1, config: dict[str, str] | None = None):
    admin = get_admin()
    new_topics = [NewTopic(t, num_partitions=num_partitions, config=config or {}) for t in topics]
    futures = admin.create_topics(new_topics)
    for topic, future in futures.items():
        try:
            future.result()
        except Exception:
            pass  # topic may already exist


def delete_topics(topics: list[str]):
    admin = get_admin()
    futures = admin.delete_topics(topics)
    for topic, future in futures.items():
        try:
            future.result()
        except Exception:
            pass
