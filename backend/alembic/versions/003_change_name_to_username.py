"""change name to username

Revision ID: 003
Revises: 002
Create Date: 2024-04-28 20:30:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 重命名 name 列为 username
    op.alter_column('users', 'name', new_column_name='username')

def downgrade() -> None:
    # 重命名 username 列为 name
    op.alter_column('users', 'username', new_column_name='name') 