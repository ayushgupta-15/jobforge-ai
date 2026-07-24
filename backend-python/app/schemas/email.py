"""JobForge AI - Email automation schemas."""
from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.models.email import EmailScheduleStatus


class EmailTemplateBase(BaseModel):
    name: str = Field(..., max_length=255)
    category: Optional[str] = Field(default=None, max_length=100)
    subject: str = Field(..., max_length=255)
    body: str
    is_default: bool = False
    is_active: bool = True


class EmailTemplateCreate(EmailTemplateBase):
    pass


class EmailTemplateUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=255)
    category: Optional[str] = Field(default=None, max_length=100)
    subject: Optional[str] = Field(default=None, max_length=255)
    body: Optional[str] = None
    is_default: Optional[bool] = None
    is_active: Optional[bool] = None


class EmailTemplateResponse(EmailTemplateBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EmailScheduleBase(BaseModel):
    to_email: EmailStr
    subject: str = Field(..., max_length=255)
    body: str
    send_at: datetime
    template_id: Optional[UUID] = None
    application_id: Optional[UUID] = None


class EmailScheduleCreate(EmailScheduleBase):
    pass


class EmailScheduleUpdate(BaseModel):
    to_email: Optional[EmailStr] = None
    subject: Optional[str] = Field(default=None, max_length=255)
    body: Optional[str] = None
    send_at: Optional[datetime] = None
    status: Optional[EmailScheduleStatus] = None
    last_error: Optional[str] = None


class EmailScheduleResponse(EmailScheduleBase):
    id: UUID
    user_id: UUID
    status: EmailScheduleStatus
    last_error: Optional[str] = None
    sent_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EmailSendRequest(BaseModel):
    to_email: EmailStr
    subject: Optional[str] = Field(default=None, max_length=255)
    body: Optional[str] = None
    template_id: Optional[UUID] = None
    application_id: Optional[UUID] = None
    variables: Optional[Dict[str, Any]] = None
    send_at: Optional[datetime] = None


class EmailSendResponse(BaseModel):
    schedule_id: UUID
    status: EmailScheduleStatus
    sent_at: Optional[datetime] = None
