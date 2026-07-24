"""Tests for app.services.rate_limit against a real Redis (see conftest.py —
isolated to DB 15 locally, DB 0 in CI's ephemeral redis service). This is a
genuine integration test, not mocked, since the whole point is verifying the
Redis-backed counter actually enforces the boundary correctly."""
from unittest.mock import patch

import pytest

from app.services import cache as cache_service
from app.services.rate_limit import RateLimitExceeded, check_and_increment


def test_nth_call_succeeds_and_n_plus_1th_is_rejected():
    limit = 3
    for i in range(limit):
        check_and_increment("user-1", "ai_chat", limit=limit, window_seconds=3600)  # calls 1..N succeed

    with pytest.raises(RateLimitExceeded):
        check_and_increment("user-1", "ai_chat", limit=limit, window_seconds=3600)  # call N+1 rejected


def test_different_users_have_independent_limits():
    limit = 2
    for _ in range(limit):
        check_and_increment("user-a", "ai_chat", limit=limit)
    # user-a is now at the limit; user-b should be unaffected.
    check_and_increment("user-b", "ai_chat", limit=limit)


def test_different_actions_have_independent_limits():
    limit = 1
    check_and_increment("user-1", "ai_chat", limit=limit)
    # Same user, different action — separate counter, should not raise.
    check_and_increment("user-1", "ai_interview_questions", limit=limit)


def test_fails_open_when_redis_unavailable():
    with patch.object(cache_service, "get_client", return_value=None):
        # Should not raise even though this would normally be well over any limit.
        for _ in range(50):
            check_and_increment("user-1", "ai_chat", limit=1)
