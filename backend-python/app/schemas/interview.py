"""JobForge AI - Interview Schemas"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
from enum import Enum

class InterviewType(str, Enum):
    PHONE = "phone"
    VIDEO = "video"
    IN_PERSON = "in_person"
    PANEL = "panel"

class InterviewStatus(str, Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"

class InterviewBase(BaseModel):
    application_id: UUID
    interview_type: InterviewType
    status: Optional[InterviewStatus] = InterviewStatus.SCHEDULED
    scheduled_at: datetime
    duration_minutes: Optional[str] = None
    interviewer_name: Optional[str] = None
    interviewer_email: Optional[str] = None
    location_or_url: Optional[str] = None
    notes: Optional[str] = None

class InterviewCreate(InterviewBase):
    pass

class InterviewUpdate(BaseModel):
    interview_type: Optional[InterviewType] = None
    status: Optional[InterviewStatus] = None
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[str] = None
    interviewer_name: Optional[str] = None
    interviewer_email: Optional[str] = None
    location_or_url: Optional[str] = None
    notes: Optional[str] = None
    feedback: Optional[str] = None

class InterviewResponse(InterviewBase):
    id: UUID
    user_id: UUID
    feedback: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
