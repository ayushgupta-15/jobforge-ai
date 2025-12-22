"""AI content generation endpoints (cover letters, interview prep)."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.api.deps import get_current_user
from app.core.database import get_db
from app.crud import resume as resume_crud
from app.crud import job as job_crud
from app.models.user import User
from app.schemas.ai import (
    CoverLetterRequest,
    CoverLetterResponse,
    InterviewQuestionsRequest,
    InterviewQuestionsResponse,
    InterviewQuestion,
)
from app.services import ai_content

router = APIRouter()


@router.post("/cover-letter", response_model=CoverLetterResponse)
async def generate_cover_letter(
    data: CoverLetterRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = resume_crud.get_resume(db, data.resume_id)
    if not resume or resume.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found",
        )
    if not resume.raw_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume text is missing; upload or parse resume first.",
        )

    job_title = "General Application"
    job_company = "Hiring Manager"
    job_description = ""

    if data.job_id:
        job = job_crud.get_job(db, data.job_id)
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found",
            )
        job_title = job.title
        job_company = job.company
        job_description = job.description or job.raw_description or ""

    try:
        result = ai_content.generate_cover_letter(
            resume_text=resume.raw_text,
            job_title=job_title,
            job_company=job_company,
            job_description=job_description,
            tone=data.tone or "professional",
            length=data.length or "medium",
            custom_notes=data.custom_notes,
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Cover letter generation failed. Please try again.",
        )

    return CoverLetterResponse(**result)


@router.post("/interview/questions", response_model=InterviewQuestionsResponse)
async def generate_interview_questions(
    data: InterviewQuestionsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Auth only; no ownership on job needed.
    job = job_crud.get_job(db, data.job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    try:
        result = ai_content.generate_interview_questions(
            job_title=job.title,
            job_company=job.company,
            job_description=job.description or job.raw_description or "",
            interview_type=data.interview_type.value,
            seniority=data.seniority,
            focus_areas=data.focus_areas,
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Interview question generation failed. Please try again.",
        )

    return InterviewQuestionsResponse(
        job_id=data.job_id,
        interview_type=data.interview_type,
        questions=[InterviewQuestion(**q) for q in result["questions"]],
        model=result["model"],
        prompt_tokens=result.get("prompt_tokens"),
        completion_tokens=result.get("completion_tokens"),
    )
