"""merge heads

Revision ID: e1549478a4ab
Revises: add_agent_type_column, e519abf51bf8
Create Date: 2025-05-01 17:03:22.223227

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e1549478a4ab'
down_revision: Union[str, None] = ('add_agent_type_column', 'e519abf51bf8')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
