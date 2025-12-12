"""JobForge AI - Job CRUD Operations"""
from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import UUID
from app.models.job import Job
from app.schemas.job import JobCreate, JobUpdate

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
        salary_min=job.salary_min,
        salary_max=job.salary_max,
        job_type=job.job_type,
        experience_level=job.experience_level,
        source_url=job.source_url,
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
