"""JobForge AI - Email schedule CRUD."""
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.email import EmailSchedule, EmailScheduleStatus
from app.schemas.email import EmailScheduleCreate, EmailScheduleUpdate


def get_schedule(db: Session, schedule_id: UUID) -> Optional[EmailSchedule]:
    return db.query(EmailSchedule).filter(EmailSchedule.id == schedule_id).first()


def get_schedules_by_user(db: Session, user_id: UUID) -> List[EmailSchedule]:
    return (
        db.query(EmailSchedule)
        .filter(EmailSchedule.user_id == user_id)
        .order_by(EmailSchedule.send_at.desc())
        .all()
    )


def get_due_schedules(db: Session, user_id: UUID, *, now: Optional[datetime] = None, limit: int = 50) -> List[EmailSchedule]:
    now = now or datetime.utcnow()
    return (
        db.query(EmailSchedule)
        .filter(
            EmailSchedule.user_id == user_id,
            EmailSchedule.status == EmailScheduleStatus.PENDING,
            EmailSchedule.send_at <= now,
        )
        .order_by(EmailSchedule.send_at.asc())
        .limit(limit)
        .all()
    )


def get_due_schedules_global(db: Session, *, now: Optional[datetime] = None, limit: int = 200) -> List[EmailSchedule]:
    now = now or datetime.utcnow()
    return (
        db.query(EmailSchedule)
        .filter(
            EmailSchedule.status == EmailScheduleStatus.PENDING,
            EmailSchedule.send_at <= now,
        )
        .order_by(EmailSchedule.send_at.asc())
        .limit(limit)
        .all()
    )


def create_schedule(db: Session, schedule: EmailScheduleCreate, user_id: UUID) -> EmailSchedule:
    db_schedule = EmailSchedule(
        user_id=user_id,
        application_id=schedule.application_id,
        template_id=schedule.template_id,
        to_email=str(schedule.to_email),
        subject=schedule.subject,
        body=schedule.body,
        send_at=schedule.send_at,
        status=EmailScheduleStatus.PENDING,
    )
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule


def update_schedule(db: Session, schedule_id: UUID, schedule_update: EmailScheduleUpdate) -> Optional[EmailSchedule]:
    db_schedule = get_schedule(db, schedule_id)
    if not db_schedule:
        return None
    update_data = schedule_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_schedule, field, value)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule


def mark_sent(db: Session, schedule_id: UUID, *, sent_at: Optional[datetime] = None) -> Optional[EmailSchedule]:
    db_schedule = get_schedule(db, schedule_id)
    if not db_schedule:
        return None
    db_schedule.status = EmailScheduleStatus.SENT
    db_schedule.sent_at = sent_at or datetime.utcnow()
    db_schedule.last_error = None
    db.commit()
    db.refresh(db_schedule)
    return db_schedule


def mark_failed(db: Session, schedule_id: UUID, *, error: str) -> Optional[EmailSchedule]:
    db_schedule = get_schedule(db, schedule_id)
    if not db_schedule:
        return None
    db_schedule.status = EmailScheduleStatus.FAILED
    db_schedule.last_error = error[:1000]
    db.commit()
    db.refresh(db_schedule)
    return db_schedule


def cancel_schedule(db: Session, schedule_id: UUID) -> Optional[EmailSchedule]:
    db_schedule = get_schedule(db, schedule_id)
    if not db_schedule:
        return None
    db_schedule.status = EmailScheduleStatus.CANCELED
    db.commit()
    db.refresh(db_schedule)
    return db_schedule
