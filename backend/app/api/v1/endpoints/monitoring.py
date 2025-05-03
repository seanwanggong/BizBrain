from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import deps
from app.services.monitoring import MonitoringService
from app.schemas.monitoring import (
    TaskExecutionStats,
    WorkflowExecutionStats,
    MonitoringStats
)

router = APIRouter()

@router.get("/task-stats", response_model=TaskExecutionStats)
async def get_task_stats(
    task_id: Optional[int] = None,
    execution_id: Optional[int] = None,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    db: AsyncSession = Depends(deps.get_db)
):
    """Get task execution statistics"""
    monitoring_service = MonitoringService(db)
    return await monitoring_service.get_task_execution_stats(
        task_id=task_id,
        execution_id=execution_id,
        start_time=start_time,
        end_time=end_time
    )

@router.get("/workflow-stats", response_model=WorkflowExecutionStats)
async def get_workflow_stats(
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    db: AsyncSession = Depends(deps.get_db)
):
    """Get workflow execution statistics"""
    monitoring_service = MonitoringService(db)
    return await monitoring_service.get_workflow_execution_stats(
        start_time=start_time,
        end_time=end_time
    )

@router.get("/stats", response_model=MonitoringStats)
async def get_monitoring_stats(
    db: AsyncSession = Depends(deps.get_db)
):
    """Get all monitoring statistics"""
    monitoring_service = MonitoringService(db)
    return await monitoring_service.get_monitoring_stats() 