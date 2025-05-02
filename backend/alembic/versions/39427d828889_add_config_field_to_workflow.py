"""add config field to workflow

Revision ID: 39427d828889
Revises: create_execution_logs
Create Date: 2024-05-01 23:23:23.223227

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '39427d828889'
down_revision: Union[str, None] = 'create_execution_logs'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add type column as nullable first
    op.add_column('agents', sa.Column('type', sa.String(), nullable=True))
    
    # Update existing rows with a default value
    op.execute("UPDATE agents SET type = 'default' WHERE type IS NULL")
    
    # Make type column non-nullable
    op.alter_column('agents', 'type', nullable=False)
    
    # Alter config column type from json to jsonb
    op.alter_column('workflows', 'config',
               existing_type=postgresql.JSON(astext_type=sa.Text()),
               type_=postgresql.JSONB(astext_type=sa.Text()),
               existing_nullable=True)


def downgrade() -> None:
    # Alter config column type back to json
    op.alter_column('workflows', 'config',
               existing_type=postgresql.JSONB(astext_type=sa.Text()),
               type_=postgresql.JSON(astext_type=sa.Text()),
               existing_nullable=True)
    
    # Remove type column from agents table
    op.drop_column('agents', 'type')
