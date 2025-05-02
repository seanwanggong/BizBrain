from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from ..models.workflow_execution import ExecutionStatus


class WorkflowExecutionBase(BaseModel):
    """工作流执行基础模型"""
    workflow_id: UUID
    user_id: UUID
    input_data: Optional[Dict[str, Any]] = None


class WorkflowExecutionCreate(WorkflowExecutionBase):
    """创建工作流执行请求模型"""
    pass


class WorkflowExecutionUpdate(BaseModel):
    """更新工作流执行请求模型"""
    status: Optional[ExecutionStatus] = None
    input_data: Optional[Dict[str, Any]] = None
    result: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class WorkflowExecutionResponse(WorkflowExecutionBase):
    """工作流执行响应模型"""
    id: UUID
    status: ExecutionStatus
    result: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True 