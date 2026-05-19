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

    # Optional services for initial deployment
    REDIS_URL: Optional[str] = None
    QDRANT_URL: Optional[str] = None
    QDRANT_COLLECTION_NAME: str = "resumes"

    # Security
    SECRET_KEY: str = "supersecretkey"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # LLM CONFIG
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_BASE_URL: str = "https://openrouter.ai/api/v1"
    OPENAI_MODEL: str = "meta-llama/llama-3.1-8b-instruct"

    # Optional future integrations
    ANTHROPIC_API_KEY: Optional[str] = None

    CORS_ORIGINS: Union[str, List[str]] = ["http://localhost:3000"]
    UPLOAD_DIR: str = "uploads"
    RESUME_UPLOAD_SUBDIR: str = "resumes"

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
