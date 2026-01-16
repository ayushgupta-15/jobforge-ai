"""JobForge AI - Job Bookmark CRUD"""
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List
from uuid import UUID

from app.models.job_bookmark import JobBookmark
from app.models.job import Job


def add_bookmark(db: Session, user_id: UUID, job_id: UUID) -> JobBookmark:
    bookmark = JobBookmark(user_id=user_id, job_id=job_id)
    try:
        db.add(bookmark)
        db.commit()
        db.refresh(bookmark)
        return bookmark
    except IntegrityError:
        db.rollback()
        # Already bookmarked; return existing.
        existing = (
            db.query(JobBookmark)
            .filter(JobBookmark.user_id == user_id, JobBookmark.job_id == job_id)
            .first()
        )
        return existing


def remove_bookmark(db: Session, user_id: UUID, job_id: UUID) -> bool:
    bookmark = (
        db.query(JobBookmark)
        .filter(JobBookmark.user_id == user_id, JobBookmark.job_id == job_id)
        .first()
    )
    if not bookmark:
        return False
    db.delete(bookmark)
    db.commit()
    return True


def get_bookmarked_jobs(db: Session, user_id: UUID) -> List[Job]:
    return (
        db.query(Job)
        .join(JobBookmark, JobBookmark.job_id == Job.id)
        .filter(JobBookmark.user_id == user_id, Job.is_active == True)
        .all()
    )
