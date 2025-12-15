"""add missing_keywords to resumes

Revision ID: a3047d03ca92
Revises: 7c24465ba963
Create Date: 2025-12-14 18:51:08.627766

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a3047d03ca92'
down_revision: Union[str, None] = '7c24465ba963'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
