"""Schemas for AI content generation endpoints."""
from typing import List, Optional
from uuid import UUID
from enum import Enum
from pydantic import BaseModel, Field


class CoverLetterRequest(BaseModel):
    resume_id: UUID
    job_id: Optional[UUID] = None
    tone: Optional[str] = Field(default="professional", description="Tone of the letter")
    length: Optional[str] = Field(default="medium", description="short, medium, or long")
    custom_notes: Optional[str] = Field(default=None, description="Extra context to include")


class CoverLetterResponse(BaseModel):
    letter: str
    model: str
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None


class InterviewType(str, Enum):
    behavioral = "behavioral"
    technical = "technical"
    system_design = "system_design"


class InterviewQuestion(BaseModel):
    question: str
    guidance: Optional[str] = None


class InterviewQuestionsRequest(BaseModel):
    job_id: UUID
    interview_type: InterviewType
    seniority: Optional[str] = None
    focus_areas: Optional[List[str]] = None


class InterviewQuestionsResponse(BaseModel):
    job_id: UUID
    interview_type: InterviewType
    questions: List[InterviewQuestion]
    model: str
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None
