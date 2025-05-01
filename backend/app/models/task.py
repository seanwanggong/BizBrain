from sqlalchemy import Column, String, Integer, Enum, DateTime, ForeignKey
from sqlalchemy.sql import func
from uuid import uuid4

from app.db.base_class import Base
from app.schemas.task import TaskStatus, TaskType

class Task(Base):
    __tablename__ = "workflow_tasks"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    type = Column(Enum(TaskType), nullable=False)
    status = Column(Enum(TaskStatus), nullable=False, default=TaskStatus.PENDING)
    workflow_id = Column(String, ForeignKey("workflows.id"), nullable=True)
    agent_id = Column(String, ForeignKey("agents.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    error_message = Column(String, nullable=True)
    progress = Column(Integer, nullable=False, default=0)
    order = Column(Integer, nullable=False, default=0) 