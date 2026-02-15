from fastapi import APIRouter
from pydantic import BaseModel

from app.kafka import produce_message, produce_tombstone

router = APIRouter()


class Practitioner(BaseModel):
    id: int
    name: str
    email: str


@router.post("/practitioners")
def create_practitioner(p: Practitioner):
    produce_message("practitioners", str(p.id), p.model_dump())
    return {"status": "produced", "topic": "practitioners", "key": str(p.id)}


@router.delete("/practitioners/{id}")
def delete_practitioner(id: int):
    produce_tombstone("practitioners", str(id))
    return {"status": "tombstone", "topic": "practitioners", "key": str(id)}
