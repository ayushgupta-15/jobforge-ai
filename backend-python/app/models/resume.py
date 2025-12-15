"""JobForge AI - Resume Model"""
from sqlalchemy import Column, String, Boolean, DateTime, Float, Text, Enum, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum
from app.core.database import Base

class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    file_url = Column(String, nullable=True)
    file_type = Column(String(50), nullable=True)  # pdf, docx, txt, etc
    is_primary = Column(Boolean, default=False)
    raw_text = Column(Text, nullable=True)
    ats_score = Column(Float, nullable=True)  # 0-100
    keyword_match_score = Column(Float, nullable=True)
    strengths = Column(JSON, nullable=True)  # List of strengths
    weaknesses = Column(JSON, nullable=True)  # List of weaknesses
    suggestions = Column(JSON, nullable=True)  # List of improvement suggestions
    missing_keywords = Column(JSON, nullable=True)  # Keywords the resume should include
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<Resume {self.title}>"
