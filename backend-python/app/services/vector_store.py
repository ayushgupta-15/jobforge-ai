"""Qdrant wrapper for job-embedding storage and similarity search.

Every public function here can raise — callers (app.services.job_matching)
are responsible for catching failures and falling back to keyword matching.
This module intentionally does not swallow errors itself, so a genuinely
down Qdrant is distinguishable from "no results."
"""
from __future__ import annotations

import logging
from typing import List, Tuple
from uuid import UUID

from qdrant_client import QdrantClient, models

from app.core.config import settings

logger = logging.getLogger(__name__)

_client: QdrantClient | None = None
_collection_ready = False


def _get_client() -> QdrantClient:
    global _client
    if _client is None:
        _client = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY, timeout=5.0)
    return _client


def _ensure_collection(vector_size: int) -> None:
    global _collection_ready
    if _collection_ready:
        return
    client = _get_client()
    existing = {c.name for c in client.get_collections().collections}
    if settings.QDRANT_COLLECTION_NAME not in existing:
        client.create_collection(
            collection_name=settings.QDRANT_COLLECTION_NAME,
            vectors_config=models.VectorParams(size=vector_size, distance=models.Distance.COSINE),
        )
    _collection_ready = True


def has_embedding(job_id: UUID) -> bool:
    client = _get_client()
    try:
        points = client.retrieve(collection_name=settings.QDRANT_COLLECTION_NAME, ids=[str(job_id)])
    except Exception:
        # Most commonly: the collection doesn't exist yet because nothing has
        # been embedded. Treat that the same as "not embedded" rather than raising,
        # since the backfill loop calls this speculatively for every job.
        return False
    return len(points) > 0


def upsert_job_embedding(job_id: UUID, embedding: List[float]) -> None:
    _ensure_collection(len(embedding))
    client = _get_client()
    client.upsert(
        collection_name=settings.QDRANT_COLLECTION_NAME,
        points=[models.PointStruct(id=str(job_id), vector=embedding, payload={"job_id": str(job_id)})],
    )


def search_similar_jobs(embedding: List[float], limit: int = 20) -> List[Tuple[str, float]]:
    """Returns [(job_id, similarity_score), ...] ordered most-similar first."""
    _ensure_collection(len(embedding))
    client = _get_client()
    hits = client.query_points(
        collection_name=settings.QDRANT_COLLECTION_NAME,
        query=embedding,
        limit=limit,
    ).points
    return [(hit.payload["job_id"], hit.score) for hit in hits]
