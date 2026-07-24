"""Job-to-resume matching.

Primary path: semantic similarity via Qdrant (embed the resume, query the
job-embedding collection for nearest neighbors).

Fallback path: keyword overlap, used per-job whenever the semantic path is
unavailable — either because Qdrant/the embedding provider is unreachable, or
because a given job hasn't been embedded yet (the backfill loop runs on an
interval, so recently-scraped jobs are briefly "not yet embedded"). This
mirrors the local-fallback pattern used elsewhere in this portfolio: a
degraded feature beats a failed request.
"""
from __future__ import annotations

import logging
import re
from typing import Dict, Iterable

from app.models.job import Job
from app.services import vector_store
from app.services.embeddings import EmbeddingError, generate_embedding

logger = logging.getLogger(__name__)


def _keyword_overlap_score(resume_text: str, job_text: str) -> float:
    """Naive keyword-overlap fallback — NOT semantic matching. Only used when
    the real embedding/Qdrant path is unavailable for a given job."""
    resume_words = set(re.findall(r"[A-Za-z0-9+#]+", resume_text.lower()))
    job_words = set(re.findall(r"[A-Za-z0-9+#]+", job_text.lower()))
    if not resume_words or not job_words:
        return 0.0
    overlap = len(resume_words.intersection(job_words))
    return round((overlap / max(len(job_words), 1)) * 100.0, 1)


def job_text_for_matching(job: Job) -> str:
    """Text representation of a job used both as embedding input and as the
    keyword-overlap fallback's corpus, so the two paths stay comparable."""
    return " ".join(filter(None, [job.title, job.company, job.location, job.description, job.requirements]))


def score_jobs_for_resume(resume_text: str, jobs: Iterable[Job]) -> Dict[object, float]:
    """Returns {job.id: match_score} in the 0-100 range for the given jobs.

    Tries real semantic similarity first; any job not covered by that (Qdrant
    down, embedding call failed, or the job simply isn't embedded yet) falls
    back to keyword overlap for that job specifically.
    """
    jobs = list(jobs)
    if not resume_text or not resume_text.strip():
        return {job.id: 0.0 for job in jobs}

    semantic_scores: Dict[str, float] = {}
    try:
        resume_embedding = generate_embedding(resume_text)
        hits = vector_store.search_similar_jobs(resume_embedding, limit=max(len(jobs), 20))
        semantic_scores = {job_id: round(score * 100, 1) for job_id, score in hits}
    except EmbeddingError:
        logger.warning("Embedding provider unavailable; falling back to keyword overlap for all jobs")
    except Exception:
        logger.warning("Qdrant unavailable; falling back to keyword overlap for all jobs", exc_info=True)

    scores: Dict[object, float] = {}
    for job in jobs:
        semantic_score = semantic_scores.get(str(job.id))
        if semantic_score is not None:
            scores[job.id] = semantic_score
        else:
            scores[job.id] = _keyword_overlap_score(resume_text, job_text_for_matching(job))
    return scores
