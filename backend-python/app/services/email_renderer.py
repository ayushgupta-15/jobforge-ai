"""Template rendering for emails."""
from __future__ import annotations

from typing import Any, Dict

from app.models.application import Application
from app.models.user import User


class _SafeDict(dict):
    def __missing__(self, key: str) -> str:
        return ""


def build_default_variables(*, user: User, application: Application | None = None) -> Dict[str, Any]:
    variables: Dict[str, Any] = {
        "user_name": user.full_name,
        "user_email": user.email,
    }
    if application:
        variables.update(
            {
                "company_name": application.company_name,
                "job_title": application.job_title,
                "job_url": application.job_url or "",
                "application_status": application.status.value,
            }
        )
    return variables


def render_template(template_text: str, variables: Dict[str, Any]) -> str:
    if not template_text:
        return ""
    safe_vars = _SafeDict({k: v for k, v in (variables or {}).items()})
    return template_text.format_map(safe_vars)
