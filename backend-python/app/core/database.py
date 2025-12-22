"""JobForge AI - Database Configuration"""
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DB_ECHO,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    _ensure_job_ai_columns()


def _ensure_job_ai_columns() -> None:
    """Backfill missing AI-related columns on the jobs table for existing databases."""
    ddl_statements = [
        "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS raw_description TEXT",
        "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS ai_summary TEXT",
        "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS ai_highlights TEXT[]",
        "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS ai_required_skills TEXT[]",
        "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS ai_compensation VARCHAR(255)",
        "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS ai_remote_policy VARCHAR(255)",
        "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS ai_last_enriched_at TIMESTAMP",
        "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS validated_source_url VARCHAR",
        "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS source_site VARCHAR(100)",
    ]
    with engine.begin() as conn:
        for stmt in ddl_statements:
            conn.execute(text(stmt))
