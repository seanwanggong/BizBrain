from typing import Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime
from ..models.workflow_task import TaskType, TaskStatus


class WorkflowTaskBase(BaseModel):
    """工作流任务基础模型"""
    name: str
    description: Optional[str] = None
    task_type: TaskType
    config: Dict[str, Any]


class WorkflowTaskCreate(WorkflowTaskBase):
    """创建工作流任务请求模型"""
    pass


class WorkflowTaskUpdate(WorkflowTaskBase):
    """更新工作流任务请求模型"""
    name: Optional[str] = None
    description: Optional[str] = None
    task_type: Optional[TaskType] = None
    config: Optional[Dict[str, Any]] = None


class WorkflowTaskResponse(WorkflowTaskBase):
    """工作流任务响应模型"""
    id: int
    workflow_id: int
    status: TaskStatus
    result: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True 