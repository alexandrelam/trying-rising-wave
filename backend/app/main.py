from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import practitioners, specialities, pipeline, events

app = FastAPI(title="Kafka/RisingWave Pipeline API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(practitioners.router, prefix="/api")
app.include_router(specialities.router, prefix="/api")
app.include_router(pipeline.router, prefix="/api/pipeline")
app.include_router(events.router, prefix="/api")
