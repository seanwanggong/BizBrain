"""change id to uuid

Revision ID: 004
Revises: 003_change_name_to_username
Create Date: 2024-04-27 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
import uuid

# revision identifiers, used by Alembic.
revision = '004'
down_revision = '003_change_name_to_username'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # First, drop the existing index on id
    op.drop_index(op.f('ix_users_id'), table_name='users')
    
    # Then modify the id column
    op.alter_column('users', 'id',
        type_=UUID(as_uuid=True),
        postgresql_using="uuid_generate_v4()",
        server_default=sa.text('uuid_generate_v4()'),
        existing_nullable=False
    )
    
    # Create the extension if it doesn't exist
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    
    # Recreate the index
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

def downgrade() -> None:
    # Drop the index
    op.drop_index(op.f('ix_users_id'), table_name='users')
    
    # Change back to integer
    op.alter_column('users', 'id',
        type_=sa.Integer(),
        postgresql_using="id::integer",
        server_default=None,
        existing_nullable=False
    ) 