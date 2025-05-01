"""add_creator_id_to_agents

Revision ID: e519abf51bf8
Revises: 
Create Date: 2024-03-24

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy import text
import uuid

# revision identifiers, used by Alembic.
revision = 'e519abf51bf8'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # 添加 creator_id 列
    op.add_column('agents', sa.Column('creator_id', postgresql.UUID(as_uuid=True), nullable=True))
    
    # 添加外键约束
    op.create_foreign_key(
        'fk_agents_creator_id_users',
        'agents', 'users',
        ['creator_id'], ['id']
    )
    
    # 获取第一个超级管理员用户的 ID
    connection = op.get_bind()
    result = connection.execute(text("SELECT id FROM users WHERE is_superuser = true ORDER BY created_at LIMIT 1"))
    admin_id = result.scalar()
    
    if admin_id is None:
        # 如果没有超级管理员，创建一个
        admin_id = uuid.uuid4()
        result = connection.execute(
            text("""
                INSERT INTO users (id, username, email, hashed_password, is_active, is_superuser)
                VALUES (:id, :username, :email, :password, :is_active, :is_superuser)
                RETURNING id
            """),
            {
                "id": admin_id,
                "username": "admin",
                "email": "admin@example.com",
                "password": "hashed_password",
                "is_active": True,
                "is_superuser": True
            }
        )
        admin_id = result.scalar()
    
    # 更新现有的 agents
    connection.execute(
        text(f"UPDATE agents SET creator_id = :admin_id WHERE creator_id IS NULL"),
        {"admin_id": admin_id}
    )
    
    # 将列设置为非空
    op.alter_column('agents', 'creator_id',
                    existing_type=postgresql.UUID(as_uuid=True),
                    nullable=False)


def downgrade():
    # 删除外键约束
    op.drop_constraint('fk_agents_creator_id_users', 'agents', type_='foreignkey')
    
    # 删除列
    op.drop_column('agents', 'creator_id')
