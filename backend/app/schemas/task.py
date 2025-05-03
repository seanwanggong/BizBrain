from enum import Enum
from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from uuid import UUID

class TaskType(str, Enum):
    LLM = "llm"
    API = "api"
    CONDITION = "condition"
    LOOP = "loop"
    PARALLEL = "parallel"

class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class TaskBase(BaseModel):
    name: str
    description: Optional[str] = None
    type: TaskType
    workflow_id: Optional[UUID] = None
    agent_id: Optional[str] = None
    order: Optional[int] = 0

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[TaskType] = None
    status: Optional[TaskStatus] = None
    workflow_id: Optional[UUID] = None
    agent_id: Optional[str] = None
    error_message: Optional[str] = None
    progress: Optional[int] = None
    order: Optional[int] = None

class Task(TaskBase):
    id: UUID
    status: TaskStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    error_message: Optional[str] = None
    progress: int = 0

    class Config:
        from_attributes = True

class TaskResponse(Task):
    """Task response model with additional fields for workflow responses"""
    workflow_id: Optional[UUID] = None
    agent_id: Optional[str] = None
    config: Optional[dict] = None
    input_mapping: Optional[dict] = None
    output_mapping: Optional[dict] = None
    next_tasks: Optional[list] = None
    error_message: Optional[str] = None
    progress: int = 0

    class Config:
        from_attributes = True 