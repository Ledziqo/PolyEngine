from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.database import create_tables, SessionLocal
from app.core.config import get_settings
from app.services.terminal import ensure_defaults

settings = get_settings()

app = FastAPI(title="PolyEngine API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router, prefix="/api")


@app.on_event("startup")
def startup() -> None:
    create_tables()
    db = SessionLocal()
    try:
        ensure_defaults(db)
    finally:
        db.close()


@app.get("/")
def root() -> dict:
    return {"name": settings.app_name, "status": "online"}
