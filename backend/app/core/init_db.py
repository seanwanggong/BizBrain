from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy import text
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

def init_db() -> None:
    """初始化数据库"""
    # 创建所有表
    Base.metadata.drop_all(bind=engine)  # 先删除所有表
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