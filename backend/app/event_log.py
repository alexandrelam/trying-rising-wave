from datetime import datetime, timezone

_events: list[dict] = []
MAX_EVENTS = 50


def log_event(type: str, topic: str, key: str, value: dict | None):
    _events.append({
        "type": type,
        "topic": topic,
        "key": key,
        "value": value,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })
    if len(_events) > MAX_EVENTS:
        del _events[: len(_events) - MAX_EVENTS]


def get_events() -> list[dict]:
    return list(_events)
