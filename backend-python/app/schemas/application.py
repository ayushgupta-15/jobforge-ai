"""JobForge AI - Application Schemas"""
from pydantic import BaseModel, Field, HttpUrl
from typing import Optional
from datetime import datetime
from uuid import UUID
from enum import Enum

class ApplicationStatus(str, Enum):
    DRAFT = "draft"
    APPLIED = "applied"
    SCREENING = "screening"
    INTERVIEW = "interview"
    OFFER = "offer"
    REJECTED = "rejected"
    ACCEPTED = "accepted"

class ApplicationBase(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=255)
    job_title: str = Field(..., min_length=1, max_length=255)
    job_url: Optional[str] = None
    status: Optional[ApplicationStatus] = ApplicationStatus.DRAFT
    applied_date: Optional[datetime] = None
    source: Optional[str] = None
    notes: Optional[str] = None
    job_id: Optional[UUID] = None

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(BaseModel):
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    job_url: Optional[str] = None
    status: Optional[ApplicationStatus] = None
    applied_date: Optional[datetime] = None
    source: Optional[str] = None
    notes: Optional[str] = None
    match_score: Optional[float] = None

class ApplicationResponse(ApplicationBase):
    id: UUID
    user_id: UUID
    match_score: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ApplicationStats(BaseModel):
    total: int
    by_status: dict
