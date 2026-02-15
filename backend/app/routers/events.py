import asyncio
import json

from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse

from app.db import get_conn
from app.event_log import get_events

router = APIRouter()


def get_counts_and_latest():
    conn = get_conn()
    cur = conn.cursor()
    result = {}

    tables = {
        "practitioners_mv": "SELECT id, name, email, speciality_ids, created_at FROM practitioners_mv ORDER BY created_at DESC",
        "specialities_mv": "SELECT id, name FROM specialities_mv ORDER BY name",
        "practitioners_with_specialities": "SELECT id, name, email, specialities, created_at FROM practitioners_with_specialities ORDER BY created_at DESC",
    }

    for name, sql in tables.items():
        try:
            cur.execute(f"SELECT count(*) FROM {name}")
            count = cur.fetchone()[0]
            cur.execute(sql)
            cols = [desc[0] for desc in cur.description]
            rows = [dict(zip(cols, row)) for row in cur.fetchall()]
            result[name] = {"count": count, "latest": rows}
        except Exception:
            result[name] = {"count": 0, "latest": []}

    cur.close()
    conn.close()
    return result


async def event_generator():
    while True:
        try:
            data = get_counts_and_latest()
        except Exception:
            data = {}
        data["event_log"] = get_events()
        yield {"event": "pipeline", "data": json.dumps(data, default=str)}
        await asyncio.sleep(2)


@router.get("/events")
async def events():
    return EventSourceResponse(event_generator())
