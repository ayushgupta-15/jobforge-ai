"""JobForge AI - Job CRUD Operations"""
from datetime import datetime
from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import UUID
from app.models.job import Job
from app.schemas.job import JobCreate, JobUpdate
from app.services.job_enrichment import enrich_job_posting

def get_job(db: Session, job_id: UUID) -> Optional[Job]:
    return db.query(Job).filter(Job.id == job_id).first()

def get_jobs(db: Session, skip: int = 0, limit: int = 100) -> List[Job]:
    return db.query(Job).filter(Job.is_active == True).offset(skip).limit(limit).all()

def search_jobs(db: Session, query: str, skip: int = 0, limit: int = 100) -> List[Job]:
    """Search jobs by title, company, or location"""
    search_term = f"%{query}%"
    return db.query(Job).filter(
        Job.is_active == True,
        (Job.title.ilike(search_term) | 
         Job.company.ilike(search_term) | 
         Job.location.ilike(search_term))
    ).offset(skip).limit(limit).all()

def create_job(db: Session, job: JobCreate) -> Job:
    db_job = Job(
        title=job.title,
        company=job.company,
        location=job.location,
        remote_type=job.remote_type,
        description=job.description,
        requirements=job.requirements,
        raw_description=job.raw_description,
        salary_min=job.salary_min,
        salary_max=job.salary_max,
        job_type=job.job_type,
        experience_level=job.experience_level,
        source_url=job.source_url,
        validated_source_url=job.validated_source_url or job.source_url,
        source_site=job.source_site,
        ai_summary=job.ai_summary,
        ai_highlights=job.ai_highlights,
        ai_required_skills=job.ai_required_skills,
        ai_compensation=job.ai_compensation,
        ai_remote_policy=job.ai_remote_policy,
        ai_last_enriched_at=job.ai_last_enriched_at,
        posted_date=job.posted_date
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

def update_job(db: Session, job_id: UUID, job_update: JobUpdate) -> Optional[Job]:
    db_job = get_job(db, job_id)
    if not db_job:
        return None
    update_data = job_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_job, field, value)
    db.commit()
    db.refresh(db_job)
    return db_job

def delete_job(db: Session, job_id: UUID) -> bool:
    db_job = get_job(db, job_id)
    if not db_job:
        return False
    db_job.is_active = False
    db.commit()
    return True

def enrich_job_listing(db: Session, job_id: UUID) -> Job:
    job = get_job(db, job_id)
    if not job:
        raise ValueError("Job not found")

    enrichment = enrich_job_posting(job)

    job.ai_summary = enrichment.summary
    job.ai_highlights = enrichment.highlights or None
    job.ai_required_skills = enrichment.required_skills or None
    job.ai_compensation = enrichment.compensation
    job.ai_remote_policy = enrichment.remote_policy
    job.validated_source_url = (
        enrichment.validated_url or job.validated_source_url or job.source_url
    )
    job.ai_last_enriched_at = datetime.utcnow()

    db.add(job)
    db.commit()
    db.refresh(job)
    return job
