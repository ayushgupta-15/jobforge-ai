"""Redis-backed per-user rate limiting for the AI endpoints.

Fails OPEN (allows the call through, logging a warning) if Redis is
unreachable — the rate limiter exists for cost control, not correctness, so a
transient Redis outage shouldn't take down AI generation entirely. This
mirrors the graceful-degradation approach used for job matching and caching
elsewhere in this service.
"""
from __future__ import annotations

import logging

from app.services import cache as cache_service

logger = logging.getLogger(__name__)


class RateLimitExceeded(Exception):
    def __init__(self, retry_after_seconds: int):
        self.retry_after_seconds = retry_after_seconds
        super().__init__(f"Rate limit exceeded; retry after {retry_after_seconds}s")


def check_and_increment(user_id: str, action: str, limit: int, window_seconds: int = 3600) -> None:
    """Raises RateLimitExceeded once `user_id` has made more than `limit` calls
    to `action` within the current `window_seconds` window. No-ops (allows the
    call) if Redis is unavailable."""
    client = cache_service.get_client()
    if client is None:
        return

    key = f"ratelimit:{action}:{user_id}"
    try:
        current = client.incr(key)
        if current == 1:
            client.expire(key, window_seconds)
        if current > limit:
            ttl = client.ttl(key)
            raise RateLimitExceeded(retry_after_seconds=ttl if ttl and ttl > 0 else window_seconds)
    except RateLimitExceeded:
        raise
    except Exception:
        logger.warning("Rate limit check failed for %s/%s; failing open", action, user_id, exc_info=True)
