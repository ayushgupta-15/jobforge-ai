"""Utilities for storing and serving uploaded files."""
from __future__ import annotations

import uuid
from pathlib import Path
from typing import Tuple

from fastapi import HTTPException, status

from app.core.config import settings

ALLOWED_RESUME_EXTENSIONS = {".pdf", ".doc", ".docx", ".txt"}
ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
UPLOAD_ROUTE_PREFIX = "uploads"


def _get_upload_root() -> Path:
    root = Path(settings.UPLOAD_DIR).expanduser().resolve()
    root.mkdir(parents=True, exist_ok=True)
    return root


def get_resume_storage_dir(user_id: uuid.UUID) -> Path:
    """Return the directory where a user's resumes should be stored."""
    base_dir = _get_upload_root() / settings.RESUME_UPLOAD_SUBDIR / str(user_id)
    base_dir.mkdir(parents=True, exist_ok=True)
    return base_dir


def save_resume_file(
    *, user_id: uuid.UUID, filename: str, content_type: str | None, file_bytes: bytes
) -> Tuple[Path, str]:
    """
    Persist an uploaded resume to disk.

    Returns a tuple containing the absolute path and the relative URL
    (e.g., /uploads/resumes/<user_id>/<file>).
    """
    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty",
        )
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 10MB limit",
        )

    extension = Path(filename).suffix.lower()
    if extension not in ALLOWED_RESUME_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type. Please upload PDF, DOC, DOCX, or TXT files.",
        )

    if content_type and content_type.lower() not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported content type",
        )

    storage_dir = get_resume_storage_dir(user_id)
    new_filename = f"{uuid.uuid4()}{extension}"
    destination = storage_dir / new_filename

    with destination.open("wb") as f:
        f.write(file_bytes)

    relative_url = f"/{UPLOAD_ROUTE_PREFIX}/{settings.RESUME_UPLOAD_SUBDIR}/{user_id}/{new_filename}"
    return destination, relative_url


def resolve_file_path(relative_url: str) -> Path:
    """
    Convert a stored relative URL into an absolute path within the uploads directory.
    Raises HTTP 404 if the resolved path is outside the upload dir for safety.
    """
    upload_root = _get_upload_root()
    trimmed = relative_url.lstrip("/")
    if not trimmed.startswith(f"{UPLOAD_ROUTE_PREFIX}/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file path")

    _, _, subpath = trimmed.partition("/")
    candidate = (upload_root / subpath) if subpath else upload_root
    try:
        resolved = candidate.resolve(strict=True)
    except FileNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    if upload_root not in resolved.parents and resolved != upload_root:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file path")
    return resolved
