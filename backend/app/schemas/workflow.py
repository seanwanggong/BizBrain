from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from .workflow_task import WorkflowTaskResponse
from app.schemas.execution import ExecutionResponse


class WorkflowBase(BaseModel):
    """工作流基础模型"""
    name: str
    description: Optional[str] = None
    config: Dict[str, Any] = Field(default_factory=dict)


class WorkflowCreate(WorkflowBase):
    """创建工作流请求模型"""
    pass


class WorkflowUpdate(WorkflowBase):
    """更新工作流请求模型"""
    name: Optional[str] = None
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None


class WorkflowResponse(WorkflowBase):
    """工作流响应模型"""
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    tasks: List[WorkflowTaskResponse] = Field(default_factory=list)
    executions: List[ExecutionResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True


class WorkflowExecutionResponse(BaseModel):
    """工作流执行响应模型"""
    workflow_id: UUID
    task_results: List[Dict[str, Any]]
    started_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

    class Config:
        from_attributes = True 