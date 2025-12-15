"""JobForge AI - Resume Schemas"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class ResumeBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    file_url: Optional[str] = None
    file_type: Optional[str] = None
    is_primary: Optional[bool] = False

class ResumeCreate(ResumeBase):
    raw_text: Optional[str] = None

class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    is_primary: Optional[bool] = None
    raw_text: Optional[str] = None
    ats_score: Optional[float] = None
    keyword_match_score: Optional[float] = None
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    suggestions: Optional[List[str]] = None
    missing_keywords: Optional[List[str]] = None

class ResumeResponse(ResumeBase):
    id: UUID
    user_id: UUID
    raw_text: Optional[str] = None
    ats_score: Optional[float] = None
    keyword_match_score: Optional[float] = None
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    suggestions: Optional[List[str]] = None
    missing_keywords: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ResumeAnalysisRequest(BaseModel):
    job_title: Optional[str] = None
    job_description: Optional[str] = None
    target_keywords: Optional[List[str]] = None
