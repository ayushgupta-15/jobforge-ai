"""Background scheduler for processing email schedules."""
from __future__ import annotations

import asyncio
import logging
from datetime import datetime

from app.core.config import settings
from app.core.database import SessionLocal
from app.crud import email_schedule as schedule_crud
from app.services.email_sender import send_email, EmailSendError

logger = logging.getLogger(__name__)


async def run_email_scheduler(stop_event: asyncio.Event) -> None:
    """Poll pending email schedules and send due messages."""
    interval = max(settings.EMAIL_SCHEDULER_INTERVAL_SECONDS, 5)
    batch_limit = max(settings.EMAIL_SCHEDULER_BATCH_LIMIT, 1)
    logger.info("Email scheduler started (interval=%s seconds)", interval)

    while not stop_event.is_set():
        processed = 0
        db = SessionLocal()
        try:
            due = schedule_crud.get_due_schedules_global(db, limit=batch_limit)
            for schedule in due:
                try:
                    send_email(
                        to_email=schedule.to_email,
                        subject=schedule.subject,
                        body=schedule.body,
                    )
                    schedule_crud.mark_sent(db, schedule.id, sent_at=datetime.utcnow())
                except EmailSendError as exc:
                    schedule_crud.mark_failed(db, schedule.id, error=str(exc))
                processed += 1
        except Exception:
            logger.exception("Email scheduler run failed")
        finally:
            db.close()

        if processed == 0:
            await asyncio.sleep(interval)
        else:
            await asyncio.sleep(min(interval, 2))

    logger.info("Email scheduler stopped")
