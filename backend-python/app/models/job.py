"""JobForge AI - Job Model"""
from sqlalchemy import Column, String, DateTime, Float, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.sql import func
import uuid
from app.core.database import Base

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String(255), nullable=False, index=True)
    company = Column(String(255), nullable=False, index=True)
    location = Column(String(255), nullable=False)
    remote_type = Column(String(50), nullable=True)  # remote, hybrid, on-site
    description = Column(Text, nullable=False)
    requirements = Column(Text, nullable=True)
    salary_min = Column(Float, nullable=True)
    salary_max = Column(Float, nullable=True)
    job_type = Column(String(50), nullable=True)  # full-time, part-time, contract, etc
    experience_level = Column(String(50), nullable=True)  # entry, mid, senior, etc
    source_url = Column(String, nullable=True)
    validated_source_url = Column(String, nullable=True)
    source_site = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    posted_date = Column(DateTime, nullable=True)
    raw_description = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)
    ai_highlights = Column(ARRAY(String), nullable=True)
    ai_required_skills = Column(ARRAY(String), nullable=True)
    ai_compensation = Column(String(255), nullable=True)
    ai_remote_policy = Column(String(255), nullable=True)
    ai_last_enriched_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<Job {self.title} at {self.company}>"
