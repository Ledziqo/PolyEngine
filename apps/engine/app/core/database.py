from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import get_settings


class Base(DeclarativeBase):
    pass


settings = get_settings()
engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def create_tables() -> None:
    if engine.dialect.name != "postgresql":
        Base.metadata.create_all(bind=engine)
        return

    with engine.begin() as connection:
        connection.execute(text("SELECT pg_advisory_lock(73942051)"))
        try:
            Base.metadata.create_all(bind=connection)
        finally:
            connection.execute(text("SELECT pg_advisory_unlock(73942051)"))
