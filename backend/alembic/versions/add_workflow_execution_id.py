"""add workflow_execution_id to execution_logs

Revision ID: add_workflow_execution_id
Revises: 
Create Date: 2024-03-19 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_workflow_execution_id'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Add workflow_execution_id column
    op.add_column('execution_logs',
        sa.Column('workflow_execution_id', postgresql.UUID(as_uuid=True), nullable=True)
    )
    
    # Add foreign key constraint
    op.create_foreign_key(
        'fk_execution_logs_workflow_execution_id',
        'execution_logs', 'workflow_executions',
        ['workflow_execution_id'], ['id'],
        ondelete='CASCADE'
    )

def downgrade():
    # Drop foreign key constraint
    op.drop_constraint(
        'fk_execution_logs_workflow_execution_id',
        'execution_logs',
        type_='foreignkey'
    )
    
    # Drop column
    op.drop_column('execution_logs', 'workflow_execution_id') 