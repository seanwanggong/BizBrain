"""create execution logs table

Revision ID: create_execution_logs
Revises: e1549478a4ab
Create Date: 2024-03-19 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'create_execution_logs'
down_revision = 'e1549478a4ab'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'execution_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('agent_id', sa.Integer(), nullable=False),
        sa.Column('input', sa.String(), nullable=False),
        sa.Column('output', sa.String(), nullable=False),
        sa.Column('steps', postgresql.JSON(), nullable=True),
        sa.Column('execution_time', sa.Float(), nullable=True),
        sa.Column('context', postgresql.JSON(), nullable=True),
        sa.Column('status', sa.String(), nullable=False, server_default='completed'),
        sa.Column('error', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['agent_id'], ['agents.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_execution_logs_id'), 'execution_logs', ['id'], unique=False)
    op.create_index(op.f('ix_execution_logs_agent_id'), 'execution_logs', ['agent_id'], unique=False)

def downgrade():
    op.drop_index(op.f('ix_execution_logs_agent_id'), table_name='execution_logs')
    op.drop_index(op.f('ix_execution_logs_id'), table_name='execution_logs')
    op.drop_table('execution_logs') 