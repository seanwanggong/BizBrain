"""add agent_type column

Revision ID: add_agent_type_column
Revises: update_workflow_tasks
Create Date: 2024-05-01 08:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_agent_type_column'
down_revision = 'update_workflow_tasks'
branch_labels = None
depends_on = None


def upgrade():
    # 添加 agent_type 列，并将现有的 type 列的值复制过来
    op.add_column('agents', sa.Column('agent_type', sa.String(), nullable=True))
    op.execute('UPDATE agents SET agent_type = type')
    op.alter_column('agents', 'agent_type', nullable=False)
    
    # 删除旧的 type 列
    op.drop_column('agents', 'type')


def downgrade():
    # 恢复旧的 type 列
    op.add_column('agents', sa.Column('type', sa.String(), nullable=True))
    op.execute('UPDATE agents SET type = agent_type')
    op.alter_column('agents', 'type', nullable=False)
    
    # 删除 agent_type 列
    op.drop_column('agents', 'agent_type') 