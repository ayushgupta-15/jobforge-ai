"""Integration test for app.services.vector_store against a real Qdrant
instance (the CI workflow provisions one as a service container). Uses
fabricated embedding vectors — no OpenRouter/embedding API call, no cost —
this only verifies the Qdrant upsert/search wiring itself, which the mocked
tests in test_job_matching.py deliberately don't cover.

Skips locally if no Qdrant is reachable at QDRANT_URL (this machine has no
Docker daemon available); runs for real in CI.
"""
from uuid import uuid4

import pytest

from app.core.config import settings
from app.services import vector_store


def _qdrant_reachable() -> bool:
    try:
        from qdrant_client import QdrantClient

        QdrantClient(url=settings.QDRANT_URL, timeout=2.0).get_collections()
        return True
    except Exception:
        return False


pytestmark = pytest.mark.skipif(not _qdrant_reachable(), reason="No Qdrant instance reachable at QDRANT_URL")


def test_upsert_then_search_returns_the_nearest_vector():
    job_id = uuid4()
    other_id = uuid4()

    vector_store.upsert_job_embedding(job_id, [1.0, 0.0, 0.0])
    vector_store.upsert_job_embedding(other_id, [0.0, 1.0, 0.0])

    hits = vector_store.search_similar_jobs([0.9, 0.1, 0.0], limit=1)

    assert len(hits) == 1
    assert hits[0][0] == str(job_id)


def test_has_embedding_reflects_upsert_state():
    job_id = uuid4()
    assert vector_store.has_embedding(job_id) is False

    vector_store.upsert_job_embedding(job_id, [0.5, 0.5, 0.0])

    assert vector_store.has_embedding(job_id) is True
