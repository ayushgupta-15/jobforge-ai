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
from app.services.job_matching import score_jobs_for_resume
from app.services import cache as cache_service

router = APIRouter()

# Job listings change on the scraper's own schedule (hours), not per-request,
# so a short cache meaningfully cuts DB load without serving stale results
# for long.
_JOB_LIST_CACHE_TTL_SECONDS = 60


@router.get("/", response_model=List[JobResponse])
def list_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get all active jobs"""
    cache_key = f"jobs:list:{skip}:{limit}"
    cached = cache_service.get_json(cache_key)
    if cached is not None:
        return cached

    jobs = job_crud.get_jobs(db, skip=skip, limit=limit)
    result = [JobResponse.model_validate(job).model_dump(mode="json") for job in jobs]
    cache_service.set_json(cache_key, result, _JOB_LIST_CACHE_TTL_SECONDS)
    return result


@router.get("/matches", response_model=List[JobMatchResponse])
def get_matches(
    resume_id: Optional[UUID] = Query(default=None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return jobs ranked by semantic similarity to the given resume (falls back
    to keyword overlap per-job if Qdrant/the embedding provider is unavailable)."""
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
    scores = score_jobs_for_resume(resume_text, jobs)
    results = [
        JobMatchResponse.model_validate({**JobResponse.model_validate(job).model_dump(), "match_score": scores[job.id]})
        for job in jobs
    ]
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
    cache_key = f"jobs:search:{q}:{skip}:{limit}"
    cached = cache_service.get_json(cache_key)
    if cached is not None:
        return cached

    jobs = job_crud.search_jobs(db, q, skip=skip, limit=limit)
    result = [JobResponse.model_validate(job).model_dump(mode="json") for job in jobs]
    cache_service.set_json(cache_key, result, _JOB_LIST_CACHE_TTL_SECONDS)
    return result

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
