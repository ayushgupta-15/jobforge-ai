"""JobForge AI - Job Schemas"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class JobBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    company: str = Field(..., min_length=1, max_length=255)
    location: str = Field(..., min_length=1, max_length=255)
    remote_type: Optional[str] = None
    description: str
    requirements: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    job_type: Optional[str] = None
    experience_level: Optional[str] = None
    source_url: Optional[str] = None

class JobCreate(JobBase):
    posted_date: Optional[datetime] = None

class JobUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    remote_type: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    job_type: Optional[str] = None
    experience_level: Optional[str] = None
    source_url: Optional[str] = None
    is_active: Optional[bool] = None

class JobResponse(JobBase):
    id: UUID
    is_active: bool
    posted_date: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
