"""JobForge AI - Resume CRUD Operations"""
from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import UUID
from app.models.resume import Resume
from app.schemas.resume import ResumeCreate, ResumeUpdate

def get_resume(db: Session, resume_id: UUID) -> Optional[Resume]:
    return db.query(Resume).filter(Resume.id == resume_id).first()

def get_resumes_by_user(db: Session, user_id: UUID) -> List[Resume]:
    return db.query(Resume).filter(Resume.user_id == user_id).all()

def get_primary_resume(db: Session, user_id: UUID) -> Optional[Resume]:
    return db.query(Resume).filter(
        Resume.user_id == user_id, 
        Resume.is_primary == True
    ).first()

def create_resume(db: Session, resume: ResumeCreate, user_id: UUID) -> Resume:
    has_existing_resume = db.query(Resume.id).filter(Resume.user_id == user_id).first() is not None
    should_be_primary = bool(resume.is_primary) or not has_existing_resume

    db_resume = Resume(
        user_id=user_id,
        title=resume.title,
        file_url=resume.file_url,
        file_type=resume.file_type,
        raw_text=resume.raw_text,
        is_primary=should_be_primary,
    )
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)

    if should_be_primary:
        db_resume = set_primary_resume(db, user_id, db_resume.id) or db_resume
    return db_resume

def update_resume(db: Session, resume_id: UUID, resume_update: ResumeUpdate) -> Optional[Resume]:
    db_resume = get_resume(db, resume_id)
    if not db_resume:
        return None
    update_data = resume_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_resume, field, value)
    db.commit()
    db.refresh(db_resume)
    return db_resume

def delete_resume(db: Session, resume_id: UUID) -> bool:
    db_resume = get_resume(db, resume_id)
    if not db_resume:
        return False
    db.delete(db_resume)
    db.commit()
    return True

def set_primary_resume(db: Session, user_id: UUID, resume_id: UUID) -> Optional[Resume]:
    # Remove primary from all other resumes
    db.query(Resume).filter(
        Resume.user_id == user_id, 
        Resume.is_primary == True
    ).update({"is_primary": False})
    
    # Set new primary
    db_resume = get_resume(db, resume_id)
    if db_resume and db_resume.user_id == user_id:
        db_resume.is_primary = True
        db.commit()
        db.refresh(db_resume)
        return db_resume
    return None
