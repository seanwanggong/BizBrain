from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.core.database import Base
from app.models.user import User
from app.models.workflow import Workflow
from app.models.workflow_task import WorkflowTask
from app.models.workflow_execution import WorkflowExecution
from app.models.task_log import TaskLog
from app.models.execution_log import ExecutionLog

def init_db():
    """初始化数据库"""
    # 创建引擎
    engine = create_engine(settings.DATABASE_URL)
    
    # 创建所有表
    Base.metadata.create_all(bind=engine)
    
    # 创建会话
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # 检查是否已经存在超级用户
        admin = db.query(User).filter(User.email == "admin@example.com").first()
        if not admin:
            # 创建超级用户
            admin = User(
                id="admin",
                email="admin@example.com",
                username="admin",
                hashed_password="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",  # "secret"
                is_active=True,
                is_superuser=True
            )
            db.add(admin)
            db.commit()
            print("Created admin user")
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db() 