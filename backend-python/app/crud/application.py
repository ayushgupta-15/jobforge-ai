"""JobForge AI - Application CRUD Operations"""
from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import UUID
from app.models.application import Application, ApplicationStatus
from app.schemas.application import ApplicationCreate, ApplicationUpdate

def get_application(db: Session, application_id: UUID) -> Optional[Application]:
    return db.query(Application).filter(Application.id == application_id).first()

def get_applications_by_user(db: Session, user_id: UUID) -> List[Application]:
    return db.query(Application).filter(Application.user_id == user_id).all()

def get_applications_by_status(db: Session, user_id: UUID, status: ApplicationStatus) -> List[Application]:
    return db.query(Application).filter(
        Application.user_id == user_id,
        Application.status == status
    ).all()

def create_application(db: Session, application: ApplicationCreate, user_id: UUID) -> Application:
    db_application = Application(
        user_id=user_id,
        company_name=application.company_name,
        job_title=application.job_title,
        job_url=application.job_url,
        status=application.status if application.status else ApplicationStatus.DRAFT,
        applied_date=application.applied_date,
        source=application.source,
        notes=application.notes,
        job_id=application.job_id
    )
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application

def update_application(db: Session, application_id: UUID, application_update: ApplicationUpdate) -> Optional[Application]:
    db_application = get_application(db, application_id)
    if not db_application:
        return None
    update_data = application_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_application, field, value)
    db.commit()
    db.refresh(db_application)
    return db_application

def delete_application(db: Session, application_id: UUID) -> bool:
    db_application = get_application(db, application_id)
    if not db_application:
        return False
    db.delete(db_application)
    db.commit()
    return True

def update_application_status(db: Session, application_id: UUID, status: ApplicationStatus) -> Optional[Application]:
    db_application = get_application(db, application_id)
    if not db_application:
        return None
    db_application.status = status
    db.commit()
    db.refresh(db_application)
    return db_application

def get_application_stats(db: Session, user_id: UUID) -> dict:
    """Get summary statistics for user's applications"""
    total = db.query(Application).filter(Application.user_id == user_id).count()
    
    by_status = {}
    for status in ApplicationStatus:
        count = db.query(Application).filter(
            Application.user_id == user_id,
            Application.status == status
        ).count()
        by_status[status.value] = count
    
    return {
        "total": total,
        "by_status": by_status
    }
