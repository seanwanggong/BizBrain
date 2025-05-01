"""update workflow tasks table

Revision ID: update_workflow_tasks
Revises: None
Create Date: 2024-03-19 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'update_workflow_tasks'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Rename task_type column to type
    op.alter_column('workflow_tasks', 'task_type', new_column_name='type')
    
    # Add order column
    op.add_column('workflow_tasks', sa.Column('order', sa.Integer(), nullable=False, server_default='0'))
    
    # Make workflow_id not nullable
    op.alter_column('workflow_tasks', 'workflow_id',
                    existing_type=sa.UUID(),
                    nullable=False)


def downgrade() -> None:
    # Revert workflow_id nullable
    op.alter_column('workflow_tasks', 'workflow_id',
                    existing_type=sa.UUID(),
                    nullable=True)
    
    # Drop order column
    op.drop_column('workflow_tasks', 'order')
    
    # Rename type column back to task_type
    op.alter_column('workflow_tasks', 'type', new_column_name='task_type') 