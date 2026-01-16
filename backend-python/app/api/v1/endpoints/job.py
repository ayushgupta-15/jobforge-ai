"""JobForge AI - Job Endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.core.database import get_db
from app.models.user import User
from app.api.deps import get_current_user
from app.schemas.job import JobCreate, JobUpdate, JobResponse, JobMatchResponse
from app.crud import job as job_crud
from app.crud import job_bookmark as bookmark_crud
from app.crud import resume as resume_crud
from app.services.job_enrichment import JobEnrichmentError
import re

router = APIRouter()


def _score_match(resume_text: str, job_text: str) -> float:
    resume_words = set(re.findall(r"[A-Za-z0-9+#]+", resume_text.lower()))
    job_words = set(re.findall(r"[A-Za-z0-9+#]+", job_text.lower()))
    if not resume_words or not job_words:
        return 0.0
    overlap = len(resume_words.intersection(job_words))
    score = (overlap / max(len(job_words), 1)) * 100.0
    return round(score, 1)

@router.get("/", response_model=List[JobResponse])
def list_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get all active jobs"""
    jobs = job_crud.get_jobs(db, skip=skip, limit=limit)
    return jobs


@router.get("/matches", response_model=List[JobMatchResponse])
def get_matches(
    resume_id: Optional[UUID] = Query(default=None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return jobs with a naive match score based on resume text."""
    resume_text = ""
    if resume_id:
        resume = resume_crud.get_resume(db, resume_id)
        if not resume or resume.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
        if not resume.raw_text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Resume text not available. Analyze or re-upload the resume.",
            )
        resume_text = resume.raw_text

    jobs = job_crud.get_jobs(db, skip=skip, limit=limit)
    results: List[JobMatchResponse] = []
    for job in jobs:
        job_text = " ".join(filter(None, [job.title, job.company, job.location, job.description, job.requirements]))
        match_score = _score_match(resume_text, job_text) if resume_text else 0.0
        results.append(JobMatchResponse.model_validate({**JobResponse.model_validate(job).model_dump(), "match_score": match_score}))
    return results


@router.get("/bookmarked", response_model=List[JobResponse])
def get_bookmarked_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    jobs = bookmark_crud.get_bookmarked_jobs(db, current_user.id)
    return jobs

@router.get("/search", response_model=List[JobResponse])
def search_jobs(
    q: str = Query(..., min_length=1),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Search jobs by title, company, or location"""
    jobs = job_crud.search_jobs(db, q, skip=skip, limit=limit)
    return jobs

@router.get("/{job_id}", response_model=JobResponse)
def get_job(
    job_id: UUID,
    db: Session = Depends(get_db)
):
    """Get a specific job"""
    job = job_crud.get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return job

@router.post("/{job_id}/enrich", response_model=JobResponse)
def enrich_job(
    job_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Trigger AI enrichment for a job posting."""
    job = job_crud.get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    try:
        enriched_job = job_crud.enrich_job_listing(db, job_id)
    except JobEnrichmentError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc

    return enriched_job


@router.post("/{job_id}/bookmark")
def bookmark_job(
    job_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    job = job_crud.get_job(db, job_id)
    if not job or not job.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    bookmark_crud.add_bookmark(db, current_user.id, job_id)
    return {"message": "Job bookmarked"}

@router.post("/", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    job_data: JobCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new job (admin only)"""
    # In a real app, check if user is admin
    job = job_crud.create_job(db, job_data)
    return job

@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: UUID,
    job_update: JobUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a job (admin only)"""
    job = job_crud.get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    
    updated_job = job_crud.update_job(db, job_id, job_update)
    return updated_job

@router.delete("/{job_id}")
def delete_job(
    job_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a job (admin only)"""
    job = job_crud.get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    
    job_crud.delete_job(db, job_id)
    return {"message": "Job deleted successfully"}


@router.delete("/{job_id}/bookmark")
def unbookmark_job(
    job_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    removed = bookmark_crud.remove_bookmark(db, current_user.id, job_id)
    if not removed:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bookmark not found")
    return {"message": "Bookmark removed"}
