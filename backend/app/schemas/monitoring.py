from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from datetime import datetime


class TaskTypeStats(BaseModel):
    """任务类型统计"""
    task_type: str
    total_count: int
    success_count: int
    failure_count: int
    average_duration: Optional[float] = None


class TaskExecutionStats(BaseModel):
    """任务执行统计"""
    total_tasks: int
    completed_tasks: int
    failed_tasks: int
    pending_tasks: int
    running_tasks: int
    average_duration: Optional[float] = None
    by_type: List[TaskTypeStats]


class WorkflowExecutionStats(BaseModel):
    """工作流执行统计"""
    total_executions: int
    completed_executions: int
    failed_executions: int
    pending_executions: int
    running_executions: int
    average_duration: Optional[float] = None


class SystemStats(BaseModel):
    """系统统计"""
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    uptime: float


class MonitoringStats(BaseModel):
    """监控统计"""
    task_stats: TaskExecutionStats
    workflow_stats: WorkflowExecutionStats
    system_stats: SystemStats
    updated_at: datetime 