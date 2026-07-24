"""Tests for app.services.job_matching — the real matching logic.

The embedding/Qdrant calls are mocked at the module boundary (app.services.job_matching's
imported names), matching the audit's requirement of no real API cost in CI. This tests:
  1. the semantic path assigns scores from Qdrant hits correctly,
  2. jobs missing from the Qdrant hits fall back to keyword overlap individually,
  3. a fully unavailable embedding provider falls back to keyword overlap for everyone,
  4. empty resume text short-circuits to all-zero scores without calling anything.
"""
from uuid import uuid4
from unittest.mock import patch

from app.models.job import Job
from app.services.embeddings import EmbeddingError
from app.services import job_matching


def _make_job(title, company="Acme", location="Remote", description="", requirements=""):
    job = Job(
        title=title,
        company=company,
        location=location,
        description=description,
        requirements=requirements,
    )
    job.id = uuid4()
    return job


def test_empty_resume_text_gives_zero_scores_without_calling_embeddings():
    jobs = [_make_job("Backend Engineer"), _make_job("Frontend Engineer")]

    with patch.object(job_matching, "generate_embedding") as mock_embed:
        scores = job_matching.score_jobs_for_resume("", jobs)

    mock_embed.assert_not_called()
    assert scores == {job.id: 0.0 for job in jobs}


def test_semantic_scores_used_when_qdrant_has_the_job():
    job_a = _make_job("Backend Engineer", description="Python, Postgres, distributed systems")
    job_b = _make_job("Frontend Engineer", description="React, TypeScript, CSS")

    with patch.object(job_matching, "generate_embedding", return_value=[0.1, 0.2, 0.3]) as mock_embed, \
         patch.object(job_matching.vector_store, "search_similar_jobs") as mock_search:
        mock_search.return_value = [(str(job_a.id), 0.91), (str(job_b.id), 0.42)]
        scores = job_matching.score_jobs_for_resume("Experienced Python backend developer", [job_a, job_b])

    mock_embed.assert_called_once()
    assert scores[job_a.id] == 91.0
    assert scores[job_b.id] == 42.0


def test_job_missing_from_qdrant_hits_falls_back_to_keyword_overlap_individually():
    embedded_job = _make_job("Backend Engineer", description="Python")
    not_yet_embedded_job = _make_job("Data Engineer", description="python pipelines and sql")

    with patch.object(job_matching, "generate_embedding", return_value=[0.1, 0.2, 0.3]), \
         patch.object(job_matching.vector_store, "search_similar_jobs") as mock_search:
        # Only the first job has a Qdrant entry; the second is missing (e.g. not
        # backfilled yet), and must fall back to keyword overlap on its own.
        mock_search.return_value = [(str(embedded_job.id), 0.85)]
        scores = job_matching.score_jobs_for_resume("python developer", [embedded_job, not_yet_embedded_job])

    assert scores[embedded_job.id] == 85.0
    # Keyword overlap: "python" is shared between resume and job text — score > 0.
    assert scores[not_yet_embedded_job.id] > 0.0


def test_embedding_provider_down_falls_back_to_keyword_overlap_for_all_jobs():
    job_a = _make_job("Backend Engineer", description="python postgres")
    job_b = _make_job("Frontend Engineer", description="react typescript")

    with patch.object(job_matching, "generate_embedding", side_effect=EmbeddingError("provider down")), \
         patch.object(job_matching.vector_store, "search_similar_jobs") as mock_search:
        scores = job_matching.score_jobs_for_resume("python developer", [job_a, job_b])

    mock_search.assert_not_called()
    assert scores[job_a.id] > 0.0  # "python" overlaps
    assert scores[job_b.id] == 0.0  # no overlap with "react typescript"


def test_qdrant_down_falls_back_to_keyword_overlap_for_all_jobs():
    job_a = _make_job("Backend Engineer", description="python postgres")

    with patch.object(job_matching, "generate_embedding", return_value=[0.1, 0.2, 0.3]), \
         patch.object(job_matching.vector_store, "search_similar_jobs", side_effect=ConnectionError("qdrant unreachable")):
        scores = job_matching.score_jobs_for_resume("python developer", [job_a])

    assert scores[job_a.id] > 0.0
