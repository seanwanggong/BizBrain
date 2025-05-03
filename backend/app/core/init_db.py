from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, inspect
from app.db.base import Base
from app.core.database import engine
from app.core.config import settings
from app.db.models import *  # This will import all models
import uuid
import os
import sys
import asyncio

def is_production_environment() -> bool:
    """检查是否在生产环境中运行"""
    return os.getenv("ENVIRONMENT", "development").lower() == "production"

def is_interactive_environment() -> bool:
    """检查是否在交互式环境中运行"""
    return sys.stdin.isatty()

def get_user_confirmation() -> bool:
    """获取用户确认"""
    if not is_interactive_environment():
        print("非交互式环境，自动继续...")
        return True
        
    while True:
        response = input("是否继续？(y/n): ").lower()
        if response in ['y', 'n']:
            return response == 'y'
        print("请输入 'y' 或 'n'")

async def init_db() -> None:
    """初始化数据库"""
    # 在生产环境中，禁止自动创建表
    if is_production_environment():
        print("错误：在生产环境中禁止自动创建数据库表")
        return

    # 检查数据库是否已存在表
    async with engine.begin() as conn:
        # 创建扩展
        await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'))
        
        # 使用 run_sync 执行同步的检查操作
        def check_tables(sync_conn):
            inspector = inspect(sync_conn)
            return inspector.get_table_names()
        
        existing_tables = await conn.run_sync(check_tables)
        
        if existing_tables:
            print(f"警告：数据库已存在以下表：{', '.join(existing_tables)}")
            if not get_user_confirmation():
                print("操作已取消")
                return
        
        # 创建不存在的表
        await conn.run_sync(Base.metadata.create_all)
        
        # 检查是否已经存在超级用户
        result = await conn.execute(text("SELECT * FROM users WHERE email = 'admin@example.com'"))
        admin = result.first()
        
        if not admin:
            # 创建超级用户
            admin_id = str(uuid.uuid4())
            await conn.execute(
                text(
                    "INSERT INTO users (id, email, username, hashed_password, is_superuser, is_active) "
                    "VALUES (:id, :email, :username, :password, :is_superuser, :is_active)"
                ),
                {
                    "id": admin_id,
                    "email": "admin@example.com",
                    "username": "admin",
                    "password": settings.FIRST_SUPERUSER_PASSWORD,
                    "is_superuser": True,
                    "is_active": True
                }
            )

if __name__ == "__main__":
    asyncio.run(init_db()) 