from fastapi import APIRouter
from pydantic import BaseModel

from app.kafka import produce_message

router = APIRouter()


class Speciality(BaseModel):
    practitioner_id: int
    speciality: str


@router.post("/specialities")
def create_speciality(s: Speciality):
    produce_message("specialities", str(s.practitioner_id), s.model_dump())
    return {"status": "produced", "topic": "specialities", "key": str(s.practitioner_id)}
