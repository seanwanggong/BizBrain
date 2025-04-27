import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.core.config import settings
import os


@pytest.fixture(scope="session")
def engine():
    """创建测试数据库引擎"""
    return create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
    )


@pytest.fixture(scope="session")
def tables(engine):
    """创建测试数据库表"""
    Base.metadata.create_all(engine)
    yield
    Base.metadata.drop_all(engine)


@pytest.fixture
def db_session(engine, tables):
    """创建测试数据库会话"""
    connection = engine.connect()
    transaction = connection.begin()
    session = sessionmaker(bind=connection)()
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(autouse=True)
def mock_settings(monkeypatch):
    """模拟设置"""
    monkeypatch.setattr(settings, "OPENAI_API_KEY", "test-api-key")
    monkeypatch.setattr(settings, "OPENAI_API_BASE", "https://api.openai.com/v1")
    monkeypatch.setattr(settings, "SQLALCHEMY_DATABASE_URL", "sqlite:///./test.db") 