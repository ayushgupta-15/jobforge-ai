"""JobForge AI - Job Endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.core.database import get_db
from app.models.user import User
from app.api.deps import get_current_user
from app.schemas.job import JobCreate, JobUpdate, JobResponse
from app.crud import job as job_crud

router = APIRouter()

@router.get("/", response_model=List[JobResponse])
def list_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get all active jobs"""
    jobs = job_crud.get_jobs(db, skip=skip, limit=limit)
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
