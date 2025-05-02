"""update execution logs constraints

Revision ID: update_execution_logs_constraints
Revises: add_workflow_execution_id
Create Date: 2024-03-19 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'update_execution_logs_constraints'
down_revision = 'add_workflow_execution_id'
branch_labels = None
depends_on = None

def upgrade():
    # Drop existing foreign key constraint
    op.drop_constraint(
        'fk_execution_logs_workflow_execution_id',
        'execution_logs',
        type_='foreignkey'
    )
    
    # Modify column to be non-nullable
    op.alter_column('execution_logs', 'workflow_execution_id',
               existing_type=postgresql.UUID(),
               nullable=False)
    
    # Add new foreign key constraint with cascade delete
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
    
    # Modify column to be nullable
    op.alter_column('execution_logs', 'workflow_execution_id',
               existing_type=postgresql.UUID(),
               nullable=True)
    
    # Add back original foreign key constraint without cascade
    op.create_foreign_key(
        'fk_execution_logs_workflow_execution_id',
        'execution_logs', 'workflow_executions',
        ['workflow_execution_id'], ['id']
    ) 