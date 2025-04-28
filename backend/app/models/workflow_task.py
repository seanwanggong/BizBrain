from sqlalchemy import Column, Integer, String, JSON, ForeignKey, DateTime, Enum, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base
import enum
from datetime import datetime


class TaskType(str, enum.Enum):
    """工作流任务类型"""
    LLM = "llm"  # 大语言模型任务
    API = "api"  # API调用任务
    CONDITION = "condition"  # 条件判断任务
    LOOP = "loop"  # 循环任务
    PARALLEL = "parallel"  # 并行任务


class TaskStatus(str, enum.Enum):
    """任务状态"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


# 任务依赖关系表
task_dependencies = Table(
    "task_dependencies",
    Base.metadata,
    Column("task_id", Integer, ForeignKey("workflow_tasks.id"), primary_key=True),
    Column("dependency_id", Integer, ForeignKey("workflow_tasks.id"), primary_key=True)
)


class WorkflowTask(Base):
    """工作流任务模型"""
    __tablename__ = "workflow_tasks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    task_type = Column(Enum(TaskType))
    config = Column(JSON)  # 任务配置
    status = Column(Enum(TaskStatus), default=TaskStatus.PENDING)
    result = Column(JSON, nullable=True)
    error_message = Column(String, nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 外键关联
    workflow_id = Column(Integer, ForeignKey("workflows.id"))
    workflow = relationship("Workflow", back_populates="tasks")
    
    # 任务依赖关系
    dependencies = relationship(
        "WorkflowTask",
        secondary=task_dependencies,
        primaryjoin="WorkflowTask.id==task_dependencies.c.task_id",
        secondaryjoin="WorkflowTask.id==task_dependencies.c.dependency_id",
        backref="dependents"
    )
    task_logs = relationship("TaskLog", back_populates="task") 