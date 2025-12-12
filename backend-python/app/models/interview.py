"""JobForge AI - Interview Model"""
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum
from app.core.database import Base

class InterviewType(str, enum.Enum):
    PHONE = "phone"
    VIDEO = "video"
    IN_PERSON = "in_person"
    PANEL = "panel"

class InterviewStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"

class Interview(Base):
    __tablename__ = "interviews"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    interview_type = Column(Enum(InterviewType), nullable=False)
    status = Column(Enum(InterviewStatus), default=InterviewStatus.SCHEDULED, nullable=False)
    scheduled_at = Column(DateTime, nullable=False)
    duration_minutes = Column(String(50), nullable=True)  # e.g., "30", "45-60", etc
    interviewer_name = Column(String(255), nullable=True)
    interviewer_email = Column(String(255), nullable=True)
    location_or_url = Column(String, nullable=True)  # Video link, office address, etc
    notes = Column(Text, nullable=True)
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<Interview {self.interview_type} on {self.scheduled_at}>"
