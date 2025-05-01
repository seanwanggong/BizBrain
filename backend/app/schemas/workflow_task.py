from typing import Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from ..models.workflow_task import TaskType, TaskStatus


class WorkflowTaskBase(BaseModel):
    """工作流任务基础模型"""
    name: str
    description: Optional[str] = None
    type: str  # Changed from task_type to type to match model
    config: Optional[Dict[str, Any]] = None  # Made optional to match model
    order: int  # Added required order field


class WorkflowTaskCreate(WorkflowTaskBase):
    """创建工作流任务模型"""
    workflow_id: UUID


class WorkflowTaskUpdate(BaseModel):
    """更新工作流任务模型"""
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    order: Optional[int] = None


class WorkflowTaskResponse(WorkflowTaskBase):
    """工作流任务响应模型"""
    id: UUID
    workflow_id: UUID
    status: TaskStatus
    result: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 