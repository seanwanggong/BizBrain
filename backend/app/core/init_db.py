from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy import text, inspect
from app.db.base import Base
from app.core.database import engine
from app.core.config import settings
from app.models.user import User
from app.models.workflow import Workflow
from app.models.workflow_task import WorkflowTask
from app.models.workflow_execution import WorkflowExecution
from app.models.task_log import TaskLog
from app.models.execution_log import ExecutionLog
import uuid
import os
import sys

def is_production_environment() -> bool:
    """检查是否在生产环境中运行"""
    return os.getenv("ENVIRONMENT", "development").lower() == "production"

def get_user_confirmation() -> bool:
    """获取用户确认"""
    if not sys.stdin.isatty():  # 如果不是交互式终端
        return False
    
    response = input("警告：此操作将修改数据库结构。是否继续？(yes/no): ")
    return response.lower() == "yes"

def init_db() -> None:
    """初始化数据库"""
    # 在生产环境中，禁止自动创建表
    if is_production_environment():
        print("错误：在生产环境中禁止自动创建数据库表")
        return

    # 检查数据库是否已存在表
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    if existing_tables:
        print(f"警告：数据库已存在以下表：{', '.join(existing_tables)}")
        if not get_user_confirmation():
            print("操作已取消")
            return
    
    # 创建不存在的表
    Base.metadata.create_all(bind=engine)
    
    # 创建会话工厂
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # 检查是否已经存在超级用户
        admin = db.query(User).filter(User.email == "admin@example.com").first()
        if not admin:
            # 创建超级用户
            admin = User(
                id=uuid.uuid4(),
                email="admin@example.com",
                username="admin",
                hashed_password=settings.FIRST_SUPERUSER_PASSWORD,
                is_superuser=True,
                is_active=True
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            
        # 创建扩展
        db.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'))
        db.commit()
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db() 