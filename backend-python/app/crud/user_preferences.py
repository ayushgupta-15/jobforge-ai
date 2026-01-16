"""JobForge AI - User Preferences CRUD"""
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
from app.models.user_preferences import UserPreferences
from app.schemas.preferences import UserPreferencesUpdate


def get_by_user_id(db: Session, user_id: UUID) -> Optional[UserPreferences]:
    return db.query(UserPreferences).filter(UserPreferences.user_id == user_id).first()


def create_default(db: Session, user_id: UUID) -> UserPreferences:
    db_prefs = UserPreferences(user_id=user_id)
    db.add(db_prefs)
    db.commit()
    db.refresh(db_prefs)
    return db_prefs


def upsert(db: Session, user_id: UUID, prefs_update: UserPreferencesUpdate) -> UserPreferences:
    db_prefs = get_by_user_id(db, user_id)
    if not db_prefs:
        db_prefs = UserPreferences(user_id=user_id)
        db.add(db_prefs)
    update_data = prefs_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_prefs, field, value)
    db.commit()
    db.refresh(db_prefs)
    return db_prefs
