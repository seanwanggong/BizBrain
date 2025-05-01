from enum import Enum
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

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
    workflow_id: Optional[str] = None
    agent_id: Optional[str] = None
    order: Optional[int] = 0

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[TaskType] = None
    status: Optional[TaskStatus] = None
    workflow_id: Optional[str] = None
    agent_id: Optional[str] = None
    error_message: Optional[str] = None
    progress: Optional[int] = None
    order: Optional[int] = None

class Task(TaskBase):
    id: str
    status: TaskStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    error_message: Optional[str] = None
    progress: int = 0

    class Config:
        from_attributes = True 