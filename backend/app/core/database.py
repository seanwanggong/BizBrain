from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.engine import URL
from sqlalchemy.dialects import postgresql
from ..core.config import settings
import logging

logger = logging.getLogger(__name__)

# # Create PostgreSQL URL
# database_url = URL.create(
#     drivername="postgresql+psycopg2",
#     username=settings.POSTGRES_USER,
#     password=settings.POSTGRES_PASSWORD,
#     host=settings.POSTGRES_SERVER,
#     port=settings.POSTGRES_PORT,
#     database=settings.POSTGRES_DB
# )

# 创建异步引擎
engine = create_async_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    echo=settings.DB_ECHO,
    pool_pre_ping=True,
    pool_size=20,  # 增加连接池大小
    max_overflow=30,  # 增加最大溢出连接数
    pool_timeout=30,  # 设置连接池超时时间
    pool_recycle=1800,  # 30分钟后回收连接
    future=True
)

# 创建异步会话工厂
AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# 获取数据库会话的依赖函数
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            logger.error(f"Database session error: {str(e)}")
            await session.rollback()
            raise
        finally:
            await session.close() 