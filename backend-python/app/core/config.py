"""JobForge AI - Configuration Module"""
from pydantic_settings import BaseSettings
from typing import List, Optional
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

    # Optional (future)
    ANTHROPIC_API_KEY: Optional[str] = None
    
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    UPLOAD_DIR: str = "uploads"
    RESUME_UPLOAD_SUBDIR: str = "resumes"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
