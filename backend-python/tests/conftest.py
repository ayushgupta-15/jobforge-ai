"""Shared pytest fixtures.

Sets required env vars *before* any `app.*` module is imported (Settings is
instantiated at import time in app.core.config), so this must run first —
pytest guarantees conftest.py is loaded before test modules are collected.
"""
import os

os.environ.setdefault("DATABASE_URL", "postgresql://test:test@localhost:5432/test_db")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/15")
os.environ.setdefault("QDRANT_URL", "http://localhost:6333")
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-pytest")
os.environ.setdefault("OPENAI_API_KEY", "sk-test-placeholder")

import pytest


@pytest.fixture(autouse=True)
def _flush_test_redis_db():
    """Isolates rate-limit/cache tests in Redis DB 15 and clears it around each test."""
    import redis
    from app.core.config import settings

    client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
    try:
        client.flushdb()
    except Exception:
        pass
    yield
    try:
        client.flushdb()
    except Exception:
        pass
