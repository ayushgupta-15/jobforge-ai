"""Thin Redis-backed cache. Degrades gracefully: any Redis failure (down,
unreachable, timeout) is logged once and treated as a cache miss / no-op
rather than raising — a cold cache is a performance regression, not an outage.
"""
from __future__ import annotations

import json
import logging
from typing import Any, Optional

import redis

from app.core.config import settings

logger = logging.getLogger(__name__)

_client: Optional[redis.Redis] = None
_disabled = False


def get_client() -> Optional[redis.Redis]:
    """Returns a connected Redis client, or None if Redis is unreachable.
    Also used by app.services.rate_limit to share the same connection/outage state."""
    global _client, _disabled
    if _disabled:
        return None
    if _client is None:
        try:
            candidate = redis.Redis.from_url(
                settings.REDIS_URL,
                socket_connect_timeout=2,
                socket_timeout=2,
                decode_responses=True,
            )
            candidate.ping()
            _client = candidate
        except Exception:
            logger.warning("Redis unavailable; caching and rate limiting are disabled for this process", exc_info=True)
            _disabled = True
            return None
    return _client


def get_json(key: str) -> Optional[Any]:
    client = get_client()
    if client is None:
        return None
    try:
        raw = client.get(key)
    except Exception:
        logger.warning("Redis GET failed for key %s", key, exc_info=True)
        return None
    return json.loads(raw) if raw else None


def set_json(key: str, value: Any, ttl_seconds: int) -> None:
    client = get_client()
    if client is None:
        return
    try:
        client.set(key, json.dumps(value), ex=ttl_seconds)
    except Exception:
        logger.warning("Redis SET failed for key %s", key, exc_info=True)
