from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from ..core.database import Base
from ..models.workflow_task import TaskStatus
from datetime import datetime

class TaskLog(Base):
    """任务执行日志模型"""
    __tablename__ = "task_logs"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("workflow_tasks.id"), nullable=False)
    execution_id = Column(Integer, ForeignKey("workflow_executions.id"), nullable=False)
    status = Column(Enum(TaskStatus), nullable=False)
    message = Column(String, nullable=True)
    result = Column(JSON, nullable=True)
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # 关系
    task = relationship("WorkflowTask", back_populates="task_logs")
    execution = relationship("WorkflowExecution", back_populates="task_logs") 