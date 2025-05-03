from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from ..models.workflow_task import TaskType, TaskStatus


class WorkflowTaskBase(BaseModel):
    """工作流任务基础模型"""
    name: str
    description: Optional[str] = None
    type: Optional[TaskType] = None  # 使用 TaskType 枚举
    config: Optional[Dict[str, Any]] = None
    order: Optional[int] = 0


class WorkflowTaskCreate(WorkflowTaskBase):
    """创建工作流任务模型"""
    workflow_id: UUID


class WorkflowTaskUpdate(BaseModel):
    """更新工作流任务模型"""
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[TaskType] = None  # 使用 TaskType 枚举
    config: Optional[Dict[str, Any]] = None
    order: Optional[int] = None
    status: Optional[TaskStatus] = None  # 添加状态字段


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
    dependencies: List[UUID] = []  # 添加依赖任务列表

    class Config:
        from_attributes = True 