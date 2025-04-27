from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base


class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    config = Column(JSON, nullable=True)  # 工作流配置
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 外键关联
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="workflows")
    
    # 工作流执行历史
    executions = relationship("WorkflowExecution", back_populates="workflow")
    
    # 工作流任务
    tasks = relationship("WorkflowTask", back_populates="workflow")


class WorkflowExecution(Base):
    __tablename__ = "workflow_executions"

    id = Column(Integer, primary_key=True, index=True)
    status = Column(String)  # pending, running, completed, failed
    result = Column(JSON, nullable=True)
    error_message = Column(String, nullable=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # 外键关联
    workflow_id = Column(Integer, ForeignKey("workflows.id"))
    workflow = relationship("Workflow", back_populates="executions")
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="workflow_executions") 