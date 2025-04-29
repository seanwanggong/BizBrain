from sqlalchemy import Column, String, JSON, DateTime, ForeignKey, Enum, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..core.database import Base
from ..models.workflow_task import TaskStatus
import uuid

class TaskLog(Base):
    """任务执行日志模型"""
    __tablename__ = "task_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text('gen_random_uuid()'))
    task_id = Column(UUID(as_uuid=True), ForeignKey("workflow_tasks.id"), nullable=False)
    execution_id = Column(UUID(as_uuid=True), ForeignKey("workflow_executions.id"), nullable=False)
    status = Column(Enum(TaskStatus), nullable=False)
    message = Column(String(500), nullable=True)
    result = Column(JSON, nullable=True)
    error_message = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'), onupdate=text('CURRENT_TIMESTAMP'), nullable=False)

    # 关系
    task = relationship("WorkflowTask", back_populates="task_logs")
    execution = relationship("WorkflowExecution", back_populates="task_logs") 