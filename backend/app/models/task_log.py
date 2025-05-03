from sqlalchemy import Column, String, JSON, DateTime, ForeignKey, Enum, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import uuid
from enum import Enum as PyEnum

class TaskLogStatus(PyEnum):
    """任务日志状态"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class TaskLog(Base):
    """任务日志模型"""
    __tablename__ = "task_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text('gen_random_uuid()'))
    task_id = Column(UUID(as_uuid=True), ForeignKey("workflow_tasks.id"), nullable=False)
    execution_id = Column(UUID(as_uuid=True), ForeignKey("workflow_executions.id"), nullable=False)
    status = Column(Enum(TaskLogStatus), default=TaskLogStatus.PENDING, nullable=False)
    input_data = Column(JSON, nullable=True)
    result = Column(JSON, nullable=True)
    error_message = Column(String(500), nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'), onupdate=text('CURRENT_TIMESTAMP'), nullable=False)

    # 关系
    task = relationship("WorkflowTask", back_populates="task_logs")
    execution = relationship("WorkflowExecution", back_populates="task_logs") 