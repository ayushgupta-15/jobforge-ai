"""LLM-powered generators for cover letters and interview preparation."""
from __future__ import annotations

import atexit
import logging
from typing import List, Optional

import httpx
from openai import OpenAI

from app.core.config import settings

logger = logging.getLogger(__name__)

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


def generate_cover_letter(
    *,
    resume_text: str,
    job_title: str,
    job_company: str,
    job_description: str,
    tone: str = "professional",
    length: str = "medium",
    custom_notes: Optional[str] = None,
) -> dict:
    """Generate a personalized cover letter."""
    if not resume_text.strip():
        raise ValueError("Resume text is empty; cannot generate cover letter.")

    client = _get_client()
    prompt_parts = [
        "Write a tailored cover letter for the candidate below.\n",
        f"Job Title: {job_title}\n",
        f"Company: {job_company}\n",
        f"Tone: {tone or 'professional'}\n",
        f"Length: {length or 'medium'}\n",
    ]
    if custom_notes:
        prompt_parts.append(f"Custom notes from user: {custom_notes}\n")
    prompt_parts.append("Job Description:\n")
    prompt_parts.append(job_description or "No description provided.\n")
    prompt_parts.append("\nResume:\n")
    prompt_parts.append(resume_text)

    try:
        completion = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You write concise, effective cover letters that sound human and sincere."},
                {"role": "user", "content": "".join(prompt_parts)},
            ],
            temperature=0.5,
        )
    except Exception as exc:
        logger.exception("Cover letter generation failed")
        raise

    choice = completion.choices[0].message
    return {
        "letter": (choice.content or "").strip(),
        "model": completion.model or settings.OPENAI_MODEL,
        "prompt_tokens": getattr(completion.usage, "prompt_tokens", None),
        "completion_tokens": getattr(completion.usage, "completion_tokens", None),
    }


def generate_interview_questions(
    *,
    job_title: str,
    job_company: str,
    job_description: str,
    interview_type: str,
    seniority: Optional[str] = None,
    focus_areas: Optional[List[str]] = None,
    count: int = 12,
) -> dict:
    """Generate interview prep questions with brief guidance."""
    client = _get_client()
    focus_text = f"Focus areas: {', '.join(focus_areas)}\n" if focus_areas else ""
    prompt = (
        "Generate concise interview preparation questions with a short guidance note for each.\n"
        f"Interview type: {interview_type}\n"
        f"Seniority: {seniority or 'mid-level'}\n"
        f"{focus_text}"
        f"Job Title: {job_title}\n"
        f"Company: {job_company}\n"
        f"Job Description:\n{job_description or 'N/A'}\n"
        f"Return exactly {count} questions."
    )

    try:
        completion = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert interview coach. Provide questions with 1-2 sentence guidance."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.4,
        )
    except Exception as exc:
        logger.exception("Interview question generation failed")
        raise

    raw = (completion.choices[0].message.content or "").strip()
    questions: List[dict] = []
    for line in raw.splitlines():
        line = line.strip()
        if not line:
            continue
        # simple split: "1. Question — Guidance"
        if " - " in line:
            q, guidance = line.split(" - ", 1)
        elif " — " in line:
            q, guidance = line.split(" — ", 1)
        else:
            q, guidance = line, ""
        # strip leading numbering
        q = q.lstrip("0123456789. ").strip()
        questions.append({"question": q, "guidance": guidance.strip() or None})

    return {
        "questions": questions,
        "model": completion.model or settings.OPENAI_MODEL,
        "prompt_tokens": getattr(completion.usage, "prompt_tokens", None),
        "completion_tokens": getattr(completion.usage, "completion_tokens", None),
    }
