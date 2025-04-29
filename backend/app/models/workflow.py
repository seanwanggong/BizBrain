from sqlalchemy import Column, String, Boolean, ForeignKey, JSON, DateTime, text, Integer, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from ..core.database import Base
from .workflow_execution import WorkflowExecution, ExecutionStatus
from .workflow_task import WorkflowTask, TaskStatus


class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text('gen_random_uuid()'))
    name = Column(String(100), index=True)
    description = Column(String(500), nullable=True)
    config = Column(JSON, nullable=True)  # 工作流配置
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))
    updated_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'), onupdate=text('CURRENT_TIMESTAMP'))
    
    # 外键关联
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    user = relationship("User", back_populates="workflows")
    
    # 工作流执行历史
    executions = relationship("WorkflowExecution", back_populates="workflow")
    
    # 工作流任务
    tasks = relationship("WorkflowTask", back_populates="workflow") 