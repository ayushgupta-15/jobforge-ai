"""Embedding generation via OpenRouter — the same LLM provider already used
for chat completions (app.services.ai_content, app.services.job_enrichment),
just pointed at an embeddings-capable model instead of a chat model."""
from __future__ import annotations

import logging
from typing import List, Optional

from openai import OpenAI

from app.core.config import settings

logger = logging.getLogger(__name__)

_client: Optional[OpenAI] = None

# Conservative character cap to stay well under the embedding model's token
# limit without needing a tokenizer just for this.
_MAX_CHARS = 8000


class EmbeddingError(Exception):
    """Raised when embedding generation fails."""


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(api_key=settings.OPENAI_API_KEY, base_url=settings.OPENAI_BASE_URL)
    return _client


def generate_embedding(text: str) -> List[float]:
    if not text or not text.strip():
        raise EmbeddingError("Cannot embed empty text.")

    client = _get_client()
    try:
        response = client.embeddings.create(
            model=settings.EMBEDDING_MODEL,
            input=text[:_MAX_CHARS],
        )
    except Exception as exc:
        logger.warning("Embedding generation failed", exc_info=True)
        raise EmbeddingError(str(exc)) from exc

    return list(response.data[0].embedding)
