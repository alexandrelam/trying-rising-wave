import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import practitioners, specialities, pipeline, events

app = FastAPI(title="Kafka/RisingWave Pipeline API")

cors_origins = os.environ.get("CORS_ORIGINS", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in cors_origins.split(",")],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(practitioners.router, prefix="/api")
app.include_router(specialities.router, prefix="/api")
app.include_router(pipeline.router, prefix="/api/pipeline")
app.include_router(events.router, prefix="/api")
