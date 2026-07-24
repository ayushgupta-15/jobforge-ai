"""Background loop that keeps Qdrant in sync with the jobs table.

Jobs are primarily inserted by the Go scraper via a direct SQL INSERT, which
bypasses any Python-side ORM hook — so embedding-on-create alone would miss
most real job ingestion. Instead this polls for jobs that don't have a Qdrant
entry yet and embeds them, the same periodic-background-task shape as
app.services.email_scheduler.
"""
from __future__ import annotations

import asyncio
import logging

from app.core.config import settings
from app.core.database import SessionLocal
from app.crud import job as job_crud
from app.services import vector_store
from app.services.embeddings import EmbeddingError, generate_embedding
from app.services.job_matching import job_text_for_matching

logger = logging.getLogger(__name__)


def embed_job_if_missing(job) -> bool:
    """Embeds a single job if it doesn't already have a Qdrant entry.
    Returns True if an embedding was generated (or already existed), False on failure."""
    try:
        if vector_store.has_embedding(job.id):
            return True
        embedding = generate_embedding(job_text_for_matching(job))
        vector_store.upsert_job_embedding(job.id, embedding)
        return True
    except EmbeddingError:
        logger.warning("Embedding provider unavailable while backfilling job %s", job.id)
        return False
    except Exception:
        logger.warning("Failed to backfill embedding for job %s", job.id, exc_info=True)
        return False


async def run_embedding_backfill(stop_event: asyncio.Event) -> None:
    interval = max(settings.EMBEDDING_BACKFILL_INTERVAL_SECONDS, 30)
    batch_limit = max(settings.EMBEDDING_BACKFILL_BATCH_LIMIT, 1)
    logger.info("Job embedding backfill started (interval=%s seconds)", interval)

    # Rotates through the full table over successive runs instead of
    # re-checking the same first `batch_limit` jobs forever.
    offset = 0

    while not stop_event.is_set():
        db = SessionLocal()
        try:
            total = job_crud.count_active_jobs(db)
            if total > 0:
                jobs = job_crud.get_jobs(db, skip=offset % total, limit=batch_limit)
                for job in jobs:
                    embed_job_if_missing(job)
                offset = (offset + batch_limit) % total
        except Exception:
            logger.exception("Job embedding backfill run failed")
        finally:
            db.close()

        try:
            await asyncio.wait_for(stop_event.wait(), timeout=interval)
        except asyncio.TimeoutError:
            pass

    logger.info("Job embedding backfill stopped")
