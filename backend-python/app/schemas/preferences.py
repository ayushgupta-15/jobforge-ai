"""JobForge AI - User Preferences Schemas"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class UserPreferencesBase(BaseModel):
    email_notifications: bool = True
    weekly_digest: bool = True
    job_alerts: bool = True
    application_updates: bool = True
    target_roles: Optional[str] = None
    target_locations: Optional[str] = None
    min_salary: Optional[int] = None
    max_salary: Optional[int] = None


class UserPreferencesUpdate(UserPreferencesBase):
    pass


class UserPreferencesResponse(UserPreferencesBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
