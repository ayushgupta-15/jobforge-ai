"""AI-powered enrichment for scraped job postings."""
from __future__ import annotations

import atexit
import json
import logging
from typing import List, Optional

import httpx
from openai import OpenAI
from pydantic import BaseModel, Field, ValidationError

from app.core.config import settings
from app.models.job import Job

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    "You are an expert job market analyst who cleans and summarizes scraped job postings. "
    "Always respond with valid JSON and never include markdown."
)


class JobEnrichmentError(Exception):
    """Raised when AI enrichment fails."""


class JobEnrichmentResult(BaseModel):
    summary: str = Field(..., min_length=20)
    highlights: List[str] = Field(default_factory=list)
    required_skills: List[str] = Field(default_factory=list)
    compensation: Optional[str] = None
    remote_policy: Optional[str] = None
    validated_url: Optional[str] = None


_openai_client: Optional[OpenAI] = None
_httpx_client: Optional[httpx.Client] = None


def _get_client() -> OpenAI:
    global _openai_client, _httpx_client
    if _openai_client is None:
        _httpx_client = httpx.Client(
            base_url=settings.OPENAI_BASE_URL,
            timeout=httpx.Timeout(60.0, connect=30.0),
            follow_redirects=True,
        )
        _openai_client = OpenAI(
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL,
            default_headers={
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "JobForge AI",
            },
            http_client=_httpx_client,
        )
    return _openai_client


def _shutdown_httpx_client() -> None:
    if _httpx_client and not _httpx_client.is_closed:
        _httpx_client.close()


atexit.register(_shutdown_httpx_client)


def _build_prompt(job: Job) -> str:
    parts = [
        "Clean up this scraped job posting and return structured JSON with keys:\n",
        "summary (2 sentences max), highlights (list of short bullet phrases), ",
        "required_skills (list of technologies/tools), compensation (string if mentioned), ",
        "remote_policy (remote/hybrid/on-site summary), validated_url (absolute https link).\n\n",
        f"Job Title: {job.title}\n",
        f"Company: {job.company}\n",
        f"Location: {job.location}\n",
    ]
    if job.remote_type:
        parts.append(f"Remote Type: {job.remote_type}\n")
    if job.job_type:
        parts.append(f"Job Type: {job.job_type}\n")
    if job.salary_min or job.salary_max:
        parts.append(
            f"Salary Range: {job.salary_min or ''} - {job.salary_max or ''}\n"
        )
    if job.raw_description:
        parts.append(f"\nRaw Description:\n{job.raw_description}\n")
    else:
        parts.append(f"\nDescription:\n{job.description}\n")
    if job.requirements:
        parts.append(f"\nRequirements:\n{job.requirements}\n")
    return "".join(parts)


def enrich_job_posting(job: Job) -> JobEnrichmentResult:
    """Call OpenAI to enrich a single job posting."""
    prompt = _build_prompt(job)
    client = _get_client()

    try:
        completion = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
            response_format={"type": "json_object"},
        )
    except Exception as exc:  # pragma: no cover - network
        logger.exception("OpenAI enrichment call failed")
        raise JobEnrichmentError("AI enrichment failed.") from exc

    content = (completion.choices[0].message.content or "").strip()
    if not content:
        raise JobEnrichmentError("AI returned an empty enrichment response.")

    try:
        return JobEnrichmentResult.model_validate_json(content)
    except (json.JSONDecodeError, ValidationError) as exc:
        logger.exception("Failed to parse AI enrichment response: %s", content)
        raise JobEnrichmentError("AI produced an invalid enrichment payload.") from exc
