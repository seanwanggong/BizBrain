from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from datetime import datetime
from ..models.workflow_execution import ExecutionStatus


class WorkflowExecutionBase(BaseModel):
    """工作流执行基础模型"""
    workflow_id: int
    user_id: int
    input_data: Optional[Dict[str, Any]] = None


class WorkflowExecutionCreate(WorkflowExecutionBase):
    """创建工作流执行请求模型"""
    pass


class WorkflowExecutionUpdate(WorkflowExecutionBase):
    """更新工作流执行请求模型"""
    status: Optional[ExecutionStatus] = None
    result: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    completed_at: Optional[datetime] = None


class WorkflowExecutionResponse(WorkflowExecutionBase):
    """工作流执行响应模型"""
    id: int
    status: ExecutionStatus
    result: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True 