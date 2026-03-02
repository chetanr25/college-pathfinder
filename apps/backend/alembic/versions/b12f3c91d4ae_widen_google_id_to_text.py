"""widen google_id to text

Revision ID: b12f3c91d4ae
Revises: a44ced82b8ee
Create Date: 2026-03-03 12:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'b12f3c91d4ae'
down_revision: Union[str, None] = 'a44ced82b8ee'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        'users',
        'google_id',
        existing_type=sa.String(255),
        type_=sa.Text(),
        existing_nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        'users',
        'google_id',
        existing_type=sa.Text(),
        type_=sa.String(255),
        existing_nullable=True,
    )
