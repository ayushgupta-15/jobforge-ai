"""JobForge AI - Interview CRUD Operations"""
from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import UUID
from app.models.interview import Interview, InterviewStatus
from app.schemas.interview import InterviewCreate, InterviewUpdate

def get_interview(db: Session, interview_id: UUID) -> Optional[Interview]:
    return db.query(Interview).filter(Interview.id == interview_id).first()

def get_interviews_by_user(db: Session, user_id: UUID) -> List[Interview]:
    return db.query(Interview).filter(Interview.user_id == user_id).all()

def get_interviews_by_application(db: Session, application_id: UUID) -> List[Interview]:
    return db.query(Interview).filter(Interview.application_id == application_id).all()

def get_upcoming_interviews(db: Session, user_id: UUID) -> List[Interview]:
    """Get upcoming scheduled interviews"""
    from datetime import datetime
    return db.query(Interview).filter(
        Interview.user_id == user_id,
        Interview.status == InterviewStatus.SCHEDULED,
        Interview.scheduled_at >= datetime.utcnow()
    ).all()

def create_interview(db: Session, interview: InterviewCreate, user_id: UUID) -> Interview:
    db_interview = Interview(
        user_id=user_id,
        application_id=interview.application_id,
        interview_type=interview.interview_type,
        status=interview.status if interview.status else InterviewStatus.SCHEDULED,
        scheduled_at=interview.scheduled_at,
        duration_minutes=interview.duration_minutes,
        interviewer_name=interview.interviewer_name,
        interviewer_email=interview.interviewer_email,
        location_or_url=interview.location_or_url,
        notes=interview.notes
    )
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)
    return db_interview

def update_interview(db: Session, interview_id: UUID, interview_update: InterviewUpdate) -> Optional[Interview]:
    db_interview = get_interview(db, interview_id)
    if not db_interview:
        return None
    update_data = interview_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_interview, field, value)
    db.commit()
    db.refresh(db_interview)
    return db_interview

def delete_interview(db: Session, interview_id: UUID) -> bool:
    db_interview = get_interview(db, interview_id)
    if not db_interview:
        return False
    db.delete(db_interview)
    db.commit()
    return True

def update_interview_status(db: Session, interview_id: UUID, status: InterviewStatus) -> Optional[Interview]:
    db_interview = get_interview(db, interview_id)
    if not db_interview:
        return None
    db_interview.status = status
    db.commit()
    db.refresh(db_interview)
    return db_interview
