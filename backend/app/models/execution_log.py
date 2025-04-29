from sqlalchemy import Column, String, JSON, DateTime, ForeignKey, Enum, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base
import uuid
import enum


class LogLevel(str, enum.Enum):
    """日志级别"""
    DEBUG = "debug"
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"


class ExecutionLog(Base):
    """执行日志模型"""
    __tablename__ = "execution_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text('gen_random_uuid()'))
    execution_id = Column(UUID(as_uuid=True), ForeignKey("workflow_executions.id"), nullable=False)
    level = Column(Enum(LogLevel), default=LogLevel.INFO, nullable=False)
    message = Column(String(500), nullable=False)
    log_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))

    # 关系
    execution = relationship("WorkflowExecution", back_populates="execution_logs") 