"""JobForge AI - Configuration Module"""
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Optional, Union
from functools import lru_cache

class Settings(BaseSettings):
    APP_NAME: str = "JobForge AI"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    DATABASE_URL: str
    DB_ECHO: bool = False
    REDIS_URL: str
    QDRANT_URL: str
    QDRANT_COLLECTION_NAME: str = "resumes"

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # 🔑 LLM CONFIG (OpenAI / OpenRouter / Local)
    OPENAI_API_KEY: str
    OPENAI_BASE_URL: str = "https://openrouter.ai/api/v1"
    OPENAI_MODEL: str = "meta-llama/llama-3.1-8b-instruct"

    # Embeddings (same OpenRouter account/key, embeddings-capable model)
    EMBEDDING_MODEL: str = "openai/text-embedding-3-small"
    EMBEDDING_DIMENSIONS: int = 1536

    # Periodic job-embedding backfill (keeps Qdrant in sync with jobs the Go
    # scraper inserts directly via SQL, which bypasses any Python-side hook)
    EMBEDDING_BACKFILL_ENABLED: bool = True
    EMBEDDING_BACKFILL_INTERVAL_SECONDS: int = 300
    EMBEDDING_BACKFILL_BATCH_LIMIT: int = 25

    # AI endpoint rate limiting (Redis-backed; fails open if Redis is down)
    AI_RATE_LIMIT_PER_HOUR: int = 20

    # Optional (future)
    ANTHROPIC_API_KEY: Optional[str] = None
    
    CORS_ORIGINS: Union[str, List[str]] = ["http://localhost:3000"]
    UPLOAD_DIR: str = "uploads"
    RESUME_UPLOAD_SUBDIR: str = "resumes"

    # Email (SMTP)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: Optional[str] = None
    SMTP_FROM_NAME: Optional[str] = None
    SMTP_USE_TLS: bool = True
    SMTP_USE_SSL: bool = False

    # Email scheduler
    EMAIL_SCHEDULER_ENABLED: bool = True
    EMAIL_SCHEDULER_INTERVAL_SECONDS: int = 60
    EMAIL_SCHEDULER_BATCH_LIMIT: int = 50

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, value):
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
