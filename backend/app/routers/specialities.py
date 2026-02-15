from fastapi import APIRouter
from pydantic import BaseModel

from app.kafka import produce_message, produce_tombstone

router = APIRouter()


class Speciality(BaseModel):
    id: int
    name: str


@router.post("/specialities")
def create_speciality(s: Speciality):
    produce_message("specialities", str(s.id), s.model_dump())
    return {"status": "produced", "topic": "specialities", "key": str(s.id)}


@router.delete("/specialities/{id}")
def delete_speciality(id: int):
    produce_tombstone("specialities", str(id))
    return {"status": "tombstone", "topic": "specialities", "key": str(id)}
