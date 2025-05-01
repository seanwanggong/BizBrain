from sqlalchemy import Column, String, JSON, DateTime, ForeignKey, Enum, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..db.base_class import Base
import uuid
from enum import Enum as PyEnum

class ExecutionLogStatus(PyEnum):
    """执行日志状态"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    DEBUG = "debug"

class ExecutionLog(Base):
    """执行日志模型"""
    __tablename__ = "execution_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text('gen_random_uuid()'))
    execution_id = Column(UUID(as_uuid=True), ForeignKey("workflow_executions.id"), nullable=False)
    level = Column(Enum(ExecutionLogStatus), default=ExecutionLogStatus.INFO, nullable=False)
    message = Column(String(500), nullable=False)
    data = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'), nullable=False)

    # 关系
    execution = relationship("WorkflowExecution", back_populates="execution_logs") 