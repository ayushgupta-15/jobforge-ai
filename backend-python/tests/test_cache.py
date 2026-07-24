"""Tests for app.services.cache against the real local/CI Redis (DB 15/0 —
see conftest.py) and its graceful-degradation behavior when Redis is down."""
from unittest.mock import patch

from app.services import cache


def test_set_then_get_round_trips_json():
    cache.set_json("test:key", {"a": 1, "b": [1, 2, 3]}, ttl_seconds=30)
    assert cache.get_json("test:key") == {"a": 1, "b": [1, 2, 3]}


def test_get_missing_key_returns_none():
    assert cache.get_json("test:does-not-exist") is None


def test_get_and_set_are_no_ops_when_redis_unavailable():
    with patch.object(cache, "get_client", return_value=None):
        cache.set_json("test:key", {"a": 1}, ttl_seconds=30)  # should not raise
        assert cache.get_json("test:key") is None  # cache miss, not an error
