"""SMTP email sending helpers."""
from __future__ import annotations

import smtplib
from email.message import EmailMessage
from typing import Optional

from app.core.config import settings


class EmailSendError(Exception):
    """Raised when email sending fails."""


def send_email(*, to_email: str, subject: str, body: str, from_email: Optional[str] = None, from_name: Optional[str] = None) -> None:
    if not settings.SMTP_HOST:
        raise EmailSendError("SMTP is not configured. Please set SMTP_HOST.")
    if not settings.SMTP_FROM_EMAIL and not from_email:
        raise EmailSendError("SMTP_FROM_EMAIL is required to send emails.")

    sender_email = from_email or settings.SMTP_FROM_EMAIL
    sender_name = from_name or settings.SMTP_FROM_NAME or "JobForge AI"

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = f"{sender_name} <{sender_email}>"
    msg["To"] = to_email
    msg.set_content(body)

    try:
        if settings.SMTP_USE_SSL:
            with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=30) as smtp:
                _login_if_configured(smtp)
                smtp.send_message(msg)
        else:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=30) as smtp:
                if settings.SMTP_USE_TLS:
                    smtp.starttls()
                _login_if_configured(smtp)
                smtp.send_message(msg)
    except Exception as exc:
        raise EmailSendError(str(exc)) from exc


def _login_if_configured(smtp: smtplib.SMTP) -> None:
    if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
        smtp.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
