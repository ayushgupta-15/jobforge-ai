"""JobForge AI - Email template CRUD."""
from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.email import EmailTemplate
from app.schemas.email import EmailTemplateCreate, EmailTemplateUpdate


def get_template(db: Session, template_id: UUID) -> Optional[EmailTemplate]:
    return db.query(EmailTemplate).filter(EmailTemplate.id == template_id).first()


def get_templates_by_user(db: Session, user_id: UUID) -> List[EmailTemplate]:
    return db.query(EmailTemplate).filter(EmailTemplate.user_id == user_id).order_by(EmailTemplate.created_at.desc()).all()


def create_template(db: Session, template: EmailTemplateCreate, user_id: UUID) -> EmailTemplate:
    db_template = EmailTemplate(
        user_id=user_id,
        name=template.name,
        category=template.category,
        subject=template.subject,
        body=template.body,
        is_default=template.is_default,
        is_active=template.is_active,
    )
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template


def update_template(db: Session, template_id: UUID, template_update: EmailTemplateUpdate) -> Optional[EmailTemplate]:
    db_template = get_template(db, template_id)
    if not db_template:
        return None
    update_data = template_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_template, field, value)
    db.commit()
    db.refresh(db_template)
    return db_template


def delete_template(db: Session, template_id: UUID) -> bool:
    db_template = get_template(db, template_id)
    if not db_template:
        return False
    db.delete(db_template)
    db.commit()
    return True
