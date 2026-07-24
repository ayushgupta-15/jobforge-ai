"""JobForge AI - Email automation endpoints."""
from datetime import datetime, timezone
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.crud import application as application_crud
from app.crud import email_template as template_crud
from app.crud import email_schedule as schedule_crud
from app.models.user import User
from app.schemas.email import (
    EmailTemplateCreate,
    EmailTemplateUpdate,
    EmailTemplateResponse,
    EmailScheduleResponse,
    EmailScheduleUpdate,
    EmailScheduleCreate,
    EmailSendRequest,
    EmailSendResponse,
)
from app.services.email_renderer import build_default_variables, render_template
from app.services.email_sender import send_email, EmailSendError

router = APIRouter()


def _normalize_to_utc_naive(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value
    return value.astimezone(timezone.utc).replace(tzinfo=None)


@router.get("/templates", response_model=List[EmailTemplateResponse])
def list_templates(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return template_crud.get_templates_by_user(db, current_user.id)


@router.post("/templates", response_model=EmailTemplateResponse, status_code=status.HTTP_201_CREATED)
def create_template(
    payload: EmailTemplateCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return template_crud.create_template(db, payload, current_user.id)


@router.put("/templates/{template_id}", response_model=EmailTemplateResponse)
def update_template(
    template_id: UUID,
    payload: EmailTemplateUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    template = template_crud.get_template(db, template_id)
    if not template or template.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    updated = template_crud.update_template(db, template_id, payload)
    if not updated:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update template")
    return updated


@router.delete("/templates/{template_id}")
def delete_template(
    template_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    template = template_crud.get_template(db, template_id)
    if not template or template.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    template_crud.delete_template(db, template_id)
    return {"message": "Template deleted"}


@router.get("/schedules", response_model=List[EmailScheduleResponse])
def list_schedules(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return schedule_crud.get_schedules_by_user(db, current_user.id)


@router.patch("/schedules/{schedule_id}", response_model=EmailScheduleResponse)
def update_schedule(
    schedule_id: UUID,
    payload: EmailScheduleUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    schedule = schedule_crud.get_schedule(db, schedule_id)
    if not schedule or schedule.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found")
    if payload.send_at:
        payload = EmailScheduleUpdate(
            **{
                **payload.model_dump(exclude_unset=True),
                "send_at": _normalize_to_utc_naive(payload.send_at),
            }
        )
    updated = schedule_crud.update_schedule(db, schedule_id, payload)
    if not updated:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update schedule")
    return updated


@router.post("/schedules/{schedule_id}/cancel", response_model=EmailScheduleResponse)
def cancel_schedule(
    schedule_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    schedule = schedule_crud.get_schedule(db, schedule_id)
    if not schedule or schedule.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found")
    updated = schedule_crud.cancel_schedule(db, schedule_id)
    if not updated:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to cancel schedule")
    return updated


@router.post("/send", response_model=EmailSendResponse)
def send_or_schedule_email(
    payload: EmailSendRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    template = None
    if payload.template_id:
        template = template_crud.get_template(db, payload.template_id)
        if not template or template.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
        if not template.is_active:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Template is inactive")

    application = None
    if payload.application_id:
        application = application_crud.get_application(db, payload.application_id)
        if not application or application.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    variables = build_default_variables(user=current_user, application=application)
    if payload.variables:
        variables.update(payload.variables)

    subject_source = payload.subject or (template.subject if template else None)
    body_source = payload.body or (template.body if template else None)
    if not subject_source or not body_source:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Subject and body are required")

    rendered_subject = render_template(subject_source, variables)
    rendered_body = render_template(body_source, variables)
    send_at = _normalize_to_utc_naive(payload.send_at) if payload.send_at else datetime.utcnow()

    schedule_payload = schedule_crud.create_schedule(
        db,
        EmailScheduleCreate(
            to_email=payload.to_email,
            subject=rendered_subject,
            body=rendered_body,
            send_at=send_at,
            template_id=payload.template_id,
            application_id=payload.application_id,
        ),
        current_user.id,
    )

    if send_at > datetime.utcnow():
        return EmailSendResponse(schedule_id=schedule_payload.id, status=schedule_payload.status)

    try:
        send_email(to_email=str(payload.to_email), subject=rendered_subject, body=rendered_body)
    except EmailSendError as exc:
        schedule_crud.mark_failed(db, schedule_payload.id, error=str(exc))
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Email send failed: {exc}") from exc

    schedule_payload = schedule_crud.mark_sent(db, schedule_payload.id) or schedule_payload
    return EmailSendResponse(schedule_id=schedule_payload.id, status=schedule_payload.status, sent_at=schedule_payload.sent_at)


@router.post("/schedules/process")
def process_due_schedules(
    limit: int = Query(25, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    due = schedule_crud.get_due_schedules(db, current_user.id, limit=limit)
    sent = 0
    failed = 0
    for schedule in due:
        try:
            send_email(to_email=schedule.to_email, subject=schedule.subject, body=schedule.body)
            schedule_crud.mark_sent(db, schedule.id)
            sent += 1
        except EmailSendError as exc:
            schedule_crud.mark_failed(db, schedule.id, error=str(exc))
            failed += 1

    return {"processed": len(due), "sent": sent, "failed": failed}
