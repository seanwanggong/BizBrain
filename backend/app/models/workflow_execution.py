from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from ..core.database import Base
from datetime import datetime
from enum import Enum as PyEnum

class ExecutionStatus(PyEnum):
    """执行状态"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class WorkflowExecution(Base):
    """工作流执行模型"""
    __tablename__ = "workflow_executions"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(Enum(ExecutionStatus), default=ExecutionStatus.PENDING, nullable=False)
    input_data = Column(JSON, nullable=True)
    result = Column(JSON, nullable=True)
    error_message = Column(String, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # 关系
    workflow = relationship("Workflow", back_populates="executions")
    user = relationship("User", back_populates="workflow_executions")
    task_logs = relationship("TaskLog", back_populates="execution") 