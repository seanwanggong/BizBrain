from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any
from ..models.workflow_task import TaskStatus

class TaskLogBase(BaseModel):
    """任务日志基础模型"""
    task_id: int
    execution_id: int
    status: TaskStatus
    message: Optional[str] = None
    result: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None

class TaskLogCreate(TaskLogBase):
    """创建任务日志模型"""
    pass

class TaskLogResponse(TaskLogBase):
    """任务日志响应模型"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 