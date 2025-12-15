"""Resume parsing helpers."""
from __future__ import annotations

from pathlib import Path
from typing import Optional

import docx2txt
from PyPDF2 import PdfReader


def extract_text_from_file(file_path: Path) -> Optional[str]:
    """Extract text from supported resume formats."""
    suffix = file_path.suffix.lower()
    try:
        if suffix == ".pdf":
            return _extract_pdf_text(file_path)
        if suffix in {".doc", ".docx"}:
            return docx2txt.process(str(file_path))
        if suffix == ".txt":
            return file_path.read_text(encoding="utf-8", errors="ignore")
        return None
    except Exception:
        # We don't want parsing failures to break uploads, so just return None.
        return None


def _extract_pdf_text(file_path: Path) -> str:
    with file_path.open("rb") as f:
        reader = PdfReader(f)
        texts = []
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                texts.append(extracted)
        return "\n".join(texts)
