"""AI-powered resume analysis helpers."""
from __future__ import annotations

import json
import logging
from typing import List, Optional

from openai import OpenAI
from pydantic import BaseModel, Field, ValidationError

from app.core.config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    "You are an elite Applicant Tracking System (ATS) that scores resumes for job seekers. "
    "Always respond with valid JSON and no additional commentary."
)


class ResumeAnalysisError(Exception):
    """Raised when AI analysis fails."""


class ResumeAnalysisResult(BaseModel):
    ats_score: float = Field(..., ge=0, le=100)
    keyword_match_score: float = Field(..., ge=0, le=100)
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)
    missing_keywords: List[str] = Field(default_factory=list)


_openai_client: Optional[OpenAI] = None


def _get_client() -> OpenAI:
    global _openai_client
    if _openai_client is None:
        _openai_client = OpenAI(
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL,   # 👈 REQUIRED
            default_headers={                  # 👈 REQUIRED
                "HTTP-Referer": "http://localhost:3000",  # or your domain
                "X-Title": "JobForge AI",
            },
        )
    return _openai_client
    

def _build_prompt(*, resume_text: str, job_title: Optional[str], job_description: Optional[str], target_keywords: Optional[List[str]]) -> str:
    parts = [
        "Analyze the resume below and provide structured recommendations.",
        "Return JSON with the following keys: ats_score (0-100), keyword_match_score (0-100), ",
        "strengths (list of short bullet points), weaknesses (list), suggestions (list), ",
        "missing_keywords (list of keywords the candidate should add).",
    ]
    if job_title:
        parts.append(f"\nTarget Role: {job_title}")
    if job_description:
        parts.append(f"\nJob Description:\n{job_description}")
    if target_keywords:
        parts.append(f"\nTarget Keywords: {', '.join(target_keywords)}")
    parts.append(f"\nResume Text:\n{resume_text}")
    return "".join(parts)


def analyze_resume_text(
    *,
    resume_text: str,
    job_title: Optional[str] = None,
    job_description: Optional[str] = None,
    target_keywords: Optional[List[str]] = None,
) -> dict:
    """Call OpenAI to analyze a resume and return structured data."""
    if not resume_text or not resume_text.strip():
        raise ResumeAnalysisError("Resume text is empty; cannot analyze.")

    prompt = _build_prompt(
        resume_text=resume_text,
        job_title=job_title,
        job_description=job_description,
        target_keywords=target_keywords,
    )

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
    except Exception as exc:
        logger.exception("OpenAI chat completion failed")
        raise ResumeAnalysisError("AI analysis failed. Please try again later.") from exc

    content = (completion.choices[0].message.content or "").strip()
    if not content:
        raise ResumeAnalysisError("AI returned an empty response.")

    try:
        result = ResumeAnalysisResult.model_validate_json(content)
        return result.model_dump()
    except (json.JSONDecodeError, ValidationError) as exc:
        logger.exception("Failed to parse AI analysis response: %s", content)
        raise ResumeAnalysisError("Received an invalid response from AI analysis.") from exc
