from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.monitoring import MonitoringService
from app.schemas.monitoring import (
    TaskExecutionStats,
    TaskTypeStats,
    ExecutionTimeline,
    ErrorAnalysis,
    PerformanceMetrics
)

router = APIRouter()

@router.get("/task-stats", response_model=TaskExecutionStats)
def get_task_stats(
    task_id: Optional[int] = None,
    execution_id: Optional[int] = None,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """Get task execution statistics"""
    monitoring_service = MonitoringService(db)
    return monitoring_service.get_task_execution_stats(
        task_id=task_id,
        execution_id=execution_id,
        start_time=start_time,
        end_time=end_time
    )

@router.get("/task-type-stats", response_model=TaskTypeStats)
def get_task_type_stats(
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """Get statistics by task type"""
    monitoring_service = MonitoringService(db)
    return monitoring_service.get_task_type_stats(
        start_time=start_time,
        end_time=end_time
    )

@router.get("/execution-timeline/{execution_id}", response_model=ExecutionTimeline)
def get_execution_timeline(
    execution_id: int,
    db: Session = Depends(get_db)
):
    """Get execution timeline"""
    monitoring_service = MonitoringService(db)
    try:
        return monitoring_service.get_execution_timeline(execution_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/error-analysis", response_model=ErrorAnalysis)
def get_error_analysis(
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """Get error analysis"""
    monitoring_service = MonitoringService(db)
    return monitoring_service.get_error_analysis(
        start_time=start_time,
        end_time=end_time
    )

@router.get("/performance-metrics", response_model=PerformanceMetrics)
def get_performance_metrics(
    time_window: int = 7,
    db: Session = Depends(get_db)
):
    """Get performance metrics"""
    monitoring_service = MonitoringService(db)
    return monitoring_service.get_performance_metrics(time_window) 