from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.dialects import postgresql
from ..core.config import settings

# Create PostgreSQL URL
database_url = URL.create(
    drivername="postgresql+psycopg2",
    username=settings.POSTGRES_USER,
    password=settings.POSTGRES_PASSWORD,
    host=settings.POSTGRES_SERVER,
    port=settings.POSTGRES_PORT,
    database=settings.POSTGRES_DB
)

# 创建引擎
engine = create_engine(
    database_url,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    future=True,
    connect_args={
        "options": "-c timezone=utc"
    }
)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建基类
Base = declarative_base()

# 获取数据库会话的依赖函数
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 